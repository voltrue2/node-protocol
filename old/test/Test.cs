using System;
using System.Text;
using System.IO;

using NodeProtocol;

class Test {
	
	public static void Main() {
		
		// Console.WriteLine("Create Hello");

		Hello hello = new Hello();
		hello.Timelist = new System.DateTime[2];
		hello.Timelist[0] = new System.DateTime(2017, 7, 17, 1, 12, 59);
		hello.Timelist[1] = new System.DateTime(2016, 10, 9, 15, 0, 0);
		hello.Uid = "UID-abcdefg";
		hello.Message = new World();
		hello.Message.SenderUid = "UID-hijk";
		hello.Message.Recipients = new string[3];
		hello.Message.Recipients[0] = "xxx";
		hello.Message.Recipients[1] = "yyy";
		hello.Message.Recipients[2] = "zzz";
		hello.Message.Message = "hello world!";
		hello.Message.Sample = new Sample1();
		hello.Message.Sample.Id = 100;
		hello.Message.Sample.Key = "KEY-123";
		hello.Message.Sample.Value = "fooo";
		hello.Message.Sample.Enabled = true;
		hello.Message.Sample.Sample2list = new Sample2[3];
		hello.Message.Sample.Sample2list[0] = new Sample2();
		hello.Message.Sample.Sample2list[0].Name = "ABC";
		hello.Message.Sample.Sample2list[1] = new Sample2();
		hello.Message.Sample.Sample2list[1].Name = "DEF";
		hello.Message.Sample.Sample2list[2] = new Sample2();
		hello.Message.Sample.Sample2list[2].Name = "GHI";
		hello.Message.Sample._eight = -128;
		hello.Message.Sample._sixteen = -100;
		hello.Message.Sample._thirtytwo = -6000;
		hello.Message.Sample.Datetime = new System.DateTime(2000, 9, 7, 0, 0, 0);
		hello.Message.Timestamp = 0xffffffff;

		// Console.WriteLine("Pack Hello");

		byte[] packed = hello.Pack();

		Console.WriteLine(string.Join(" ", packed));

		/*
		Console.WriteLine("Unpack Hello");

		Hello hello2 = new Hello(packed);

		Console.WriteLine(hello2);
		*/
	}

}
