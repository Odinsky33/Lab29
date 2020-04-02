using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Npgsql;

namespace lab2._9
{
    public partial class Form1 : Form
    {
        DataSet ds = new DataSet();
        public Form1()
        {
            InitializeComponent();
        }

        
        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button3_Click(object sender, EventArgs e)
        {
            string strconn = string.Format("Server={0};Port={1};User ID={2};Password={3};Database={4}", textBox1.Text, textBox2.Text, textBox3.Text, textBox4.Text, textBox5.Text);
            using (NpgsqlConnection cnn = new NpgsqlConnection(strconn))
            {
                string stsql = "select * from \"Поставщик\";";
                NpgsqlDataAdapter da = new NpgsqlDataAdapter(stsql, cnn);
                da.Fill(ds, "Поставщики");
                stsql = "select \"Код_товара\",\"Категория_товара\",\"Наименование\",\"Кол_во_упак\", \"Кол_во_в_упак\", \"Цена_опт\", \"Цена_розн\",\"Срок_годн\",\"Дата_поступления\", \"Возврат\", \"Поставщик\", \"ФИО_сотрудника\" from \"Товары\" inner join \"Сотрудник\" On \"Товары\".\"Сотрудник\"=\"Сотрудник\".\"Код_сотрудника\";";
                da = new NpgsqlDataAdapter(stsql, cnn);
                da.Fill(ds, "Товары");
            }
            //Добавление вычисляемых и итоговых полей
            ds.Tables["Товары"].Columns.Add("Всего", typeof(decimal), "Кол_во_упак*Кол_во_в_упак*Цена_опт");
            ds.Tables["Поставщики"].Columns.Add("Среднее", typeof(decimal), "AVG(Child.Всего)"); //Если дочерних таблиц несколько, то Child(имя_связи)
            dataGridView1.DataSource = ds;
            dataGridView1.DataMember = "Поставщики";
            //dataGridView1.DataSource = ds.Tables["Поставщики"];
            dataGridView2.DataSource = ds;
            dataGridView2.DataMember = "Поставщики.Relation1";
        }

        private void dataGridView1_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {
            dataGridView1.Columns[0].Visible = false;
            dataGridView2.Columns["Категория_товара"].Visible = false;
            dataGridView2.Columns["Цена_розн"].Visible = false;

            dataGridView2.Columns["Всего"].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight; //выравнивание по правому краю
            dataGridView1.Columns[3].DefaultCellStyle.Format = "#.00";//форматчисла
            dataGridView1.Columns[3].DefaultCellStyle.Alignment = DataGridViewContentAlignment.MiddleRight; //выравниваниепоправомукраю
            dataGridView1.RowsDefaultCellStyle.BackColor = Color.Bisque;//цветфона
            dataGridView1.AlternatingRowsDefaultCellStyle.BackColor = Color.Aquamarine;//альтернативныйцветфона

            DataGridViewButtonColumn cb = new DataGridViewButtonColumn();
            dataGridView1.Columns.Add(cb);
            cb.Text = "Нажми на меня";
            cb.Name = "кнопки";
            cb.UseColumnTextForButtonValue = true;

            MessageBox.Show("Вы щелкнули по " + (e.RowIndex + 1) + " -й строке " + (e.ColumnIndex + 1) + "-й колонке\nСодержимое ячейки: " + dataGridView1[e.ColumnIndex, e.RowIndex].Value);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            string strconn = string.Format("Server={0};Port={1};User ID={2};Password={3};Database={4}", textBox1.Text, textBox2.Text, textBox3.Text, textBox4.Text, textBox5.Text);
            NpgsqlConnection cnn = new NpgsqlConnection(strconn);
            cnn.Open();
            MessageBox.Show(cnn.State.ToString());
            cnn.Close();
            MessageBox.Show(cnn.State.ToString());
        }

        private void button2_Click(object sender, EventArgs e)
        {
            DataView dv = new DataView(ds.Tables["Товары"]);//СозданиеобъектаDataView
            dv.Sort = "Наименование";// определение поля(полей сортировки).
            dataGridView3.DataSource = dv;// DataView – источникданныхдляdataGridView3
        }

        private void button4_Click(object sender, EventArgs e)
        {
            DataView dv = new DataView(ds.Tables["Товары"]);
            dv.Sort = "Наименование";
            StringBuilder result = new StringBuilder();
            DataRowView[] нашли;
            try
            {
                нашли = dv.FindRows(new object[] { textBox6.Text});
            }
            catch (FormatException ex)
            {
                MessageBox.Show(ex.Message);
                return;
            }
            // выводим результаты
            if (нашли.Length == 0)
                result.Append("Hи одной строки не найдено.");
            else
                result.Append("Код\tДата поставки" + Environment.NewLine);
            // перебираем коллекцию найденных строк
            foreach (DataRowView row in нашли)
            {
                result.Append(row["Код_товара"] + "\t" +
                row["Дата_поступления"] +
                Environment.NewLine);
            }
            result.Append("Количество\t" + нашли.Length + Environment.NewLine); MessageBox.Show(result.ToString());
        }
    }
}
