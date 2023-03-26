const TokenTypes = Object.freeze({
  ID: Symbol("ID"),
  LBRACKET: Symbol("("),
  RBRACKET: Symbol(")"),
  AND: Symbol("&"),
  OR: Symbol("|"),
  IMPL: Symbol("->"),
  NEG: Symbol("!"),
  SPACE: Symbol(" "),
  TAB: Symbol("\t"),
});

class Token {
  constructor(val, type, tokenIdx, strExprStartIdx) {
    this.val = val;
    this.tokenIdx = tokenIdx
    this.strExprStartIdx = strExprStartIdx;
    
    if (type === undefined)
      this.type = Token.getTokenType(val);
    else
      this.type = type;

  }

  static getTokenType(c) {
    if (c === '(')
      return TokenTypes.LBRACKET;
    else if (c === ')')
      return TokenTypes.RBRACKET;
    else if (c.isAlpha())
      return TokenTypes.ID;
    else if (c === '-' || c === '>')
      return TokenTypes.IMPL;
    else if (c === '|')
      return TokenTypes.OR;
    else if (c === '&')
      return TokenTypes.AND;
    else if (c === '!')
      return TokenTypes.NEG;
    else if (c === ' ')
      return TokenTypes.SPACE;
    else if (c === ' ')
      return TokenTypes.TAB;
    
  }

  equals(other) {
    return this.val === other.val && this.op === other.op;
  }
}



class Expr {
  static constructorTypes = Object.freeze({
    FROM_TOKENS: Symbol("FROM_TOKENS"),
    FROM_STR_EXPRESSION: Symbol("FROM_STR_EXPRESSION")
  })

  constructor(arg, type) {
    if (type == Expr.constructorTypes.FROM_TOKENS){
      this.tokens = arg;
      this.strExpr = this.tokens.reduce((acc, token) => acc + token.val, '');
    }
    else if (type == Expr.constructorTypes.FROM_STR_EXPRESSION) {
      this.strExpr = arg.trim(); // trim для проверки случая, когда скобки две, но они не захватывают всё выражение
      this.tokens = Expr.produceTokens(this.strExpr);
    }
    this.bracketsPrioritiesInfo = Expr.getBracketsPrioritiesInfo(this);
  }
  
  equals(other) {
    let equality = true

    if (this.tokens.length != other.tokens.length)
      return false;
    
    for (let i = 0; i < this.length; i++)
    equality &&= this.tokens[i] === other.tokens[i];
    
    return equality;
  }
  
  specialTrim() {
    if (this.bracketsPrioritiesInfo.length == 0 || this.bracketsPrioritiesInfo[0].pos != 0)
      return this;


    let level = 0;
    let left = 0, right = 0;
    right = -1;
    
    do {
      left = right + 1;
      right = this.bracketsPrioritiesInfo.findWhile(info => info.level == level, left) - 1;

      level += 1;
    } while (right - left + 1 == 2);

    level -= 1;

    console.log(this)
    console.log(level);
    console.log(this.bracketsPrioritiesInfo);
    
    let newTokens;
    
    // if (right - left > 2)
    //   level -= 1;

    if (level > 0) {
      console.log('INSIDE')
      console.log(level);
      console.log(this.bracketsPrioritiesInfo)
      console.log(this.bracketsPrioritiesInfo[2*level - 2])
      console.log(this.bracketsPrioritiesInfo[2*level - 1])
      newTokens = this.tokens.slice(
        this.bracketsPrioritiesInfo[2*level - 2].pos + 1,
        this.bracketsPrioritiesInfo[2*level - 1].pos
      );
      
      for (let i = 0; i < newTokens.length; i++)
        newTokens[i].tokenIdx = i;
      console.log(new Expr(newTokens, Expr.constructorTypes.FROM_TOKENS))
      return new Expr(newTokens, Expr.constructorTypes.FROM_TOKENS);
    }
    else
      return this;
  }

  
  static getBracketsPrioritiesInfo(expr) {
    let tokens = expr.tokens;
    let level = 0;
    let priorities = [];
    
    for (let pos = 0; pos < tokens.length; pos++)
      if (tokens[pos].type === TokenTypes.LBRACKET) {
        priorities.push({
          level: level,
          pos: pos
        });
        level += 1;
      }
      else if (tokens[pos].type === TokenTypes.RBRACKET) {
        level -= 1;
        priorities.push({
          level: level,
          pos: pos
        });
      }

    priorities.sort((a, b) => a.level-b.level)

    return priorities;
  }

  absoluteEquals(other) {
    const predicate = 
      v => v != TokenTypes.SPACE && v != TokenTypes.TAB;
    
    const newThis = new Expr(
      this.tokens.filter((t, i, tokens) => predicate(t.type)),
      Expr.constructorTypes.FROM_TOKENS
    );
    const newOther = new Expr(
      other.tokens.filter((t, i, tokens) => predicate(t.type)),
      Expr.constructorTypes.FROM_TOKENS
    );

    return newThis.strExpr === newOther.strExpr; 
  }
  
  static produceTokens(strExpr) {
    let tokens = [];
    const specialStrExpr = strExpr + ' ';
    if (specialStrExpr.length == 1){
      tokens.push(new Token(specialStrExpr, Token.getTokenType(specialStrExpr), 0, 0));
    }
    else {
      let buf = '';
      const startI = 0;
      let curChar = specialStrExpr[startI];
      let curCharType = Token.getTokenType(curChar);
      let tokenCount = 0;

      for (let i = startI; i < specialStrExpr.length - 1; i++) {    
        let nextChar = specialStrExpr[i + 1];
        let nextCharType = Token.getTokenType(nextChar);
        const terminalState = 
          // i == specialStrExpr.length ||
          curCharType == TokenTypes.LBRACKET ||
          curCharType == TokenTypes.RBRACKET ||
          curCharType == TokenTypes.NEG ||
          curCharType != nextCharType;
        
        buf += curChar;

        if (terminalState) {
          let startNewTypeIdx = i - buf.length + 1;
          let tokenIdx = tokenCount++;
          let token = new Token(buf, curCharType, tokenIdx, startNewTypeIdx);
          tokens.push(token);

          buf = '';
        }

        curChar = nextChar;
        curCharType = nextCharType;
      }
      
      return tokens;
    }
  }

  slice(from, to) {
    let pseudoSlice = this.tokens.pseudoSliceObj(from, to);
    let strExpr = '';

    for (let i = 0; i < pseudoSlice.length; i++)
      strExpr += pseudoSlice.get(i).val;
    
    return new Expr(strExpr, Expr.constructorTypes.FROM_STR_EXPRESSION);
  }
}