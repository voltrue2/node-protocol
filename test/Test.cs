using System;
using System.Text;
using System.IO;

using NodeProtocol;

class Test {
	
	public static void Main() {
		
		Console.WriteLine("1");

		Hello hello = new Hello();
		hello.Timelist = new System.DateTime[1];
		hello.Timelist[0] = new System.DateTime();
		
		Console.WriteLine("2");

		hello.Uid = "uid-1234";
		hello.Message = new World();
		hello.Message.SenderUid = "uid-5678";

		Console.WriteLine("2.5");

		hello.Message.Recipients = new string[2];
		
		Console.WriteLine("3");

		hello.Message.Recipients[0] = "person 1";
		hello.Message.Recipients[1] = "person 2";
		hello.Message.Message = "Hello World";
		hello.Message.Sample = new Sample1();
		hello.Message.Sample.Id = 100;
		hello.Message.Sample.Key = "key-abc";
		hello.Message.Sample.Value = "value-edf";
		hello.Message.Sample.Enabled = false;
		hello.Message.Sample.Sample2list = new Sample2[1];
		hello.Message.Sample.Sample2list[0] = new Sample2();
		
		Console.WriteLine("4");

		hello.Message.Sample.Sample2list[0].Name = "name-098";
		hello.Message.Sample._eight = 8;
		hello.Message.Sample._sixteen = 10000;
		hello.Message.Sample._thirtytwo = 100000;
		hello.Message.Sample.Datetime = new System.DateTime();
		
		Console.WriteLine("5");

		byte[] packed = hello.Pack();
		
		Console.WriteLine("6");

		Hello hello2 = new Hello(packed);

		Console.WriteLine(hello2);
	}

}
