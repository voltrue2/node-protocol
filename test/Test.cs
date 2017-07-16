using System;
using System.Text;
using System.IO;

using NodeProtocol;

class Test {
	
	public static void Main() {
		
		Console.WriteLine("Create Hello");

		Hello hello = new Hello();
		hello.Timelist = new System.DateTime[1];
		hello.Timelist[0] = new System.DateTime();
		hello.Uid = "uid-1234";
		hello.Message = new World();
		hello.Message.SenderUid = "uid-5678";
		hello.Message.Recipients = new string[2];
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
		hello.Message.Sample.Sample2list[0].Name = "name-098";
		hello.Message.Sample._eight = 8;
		hello.Message.Sample._sixteen = 10000;
		hello.Message.Sample._thirtytwo = 100000;
		hello.Message.Sample.Datetime = new System.DateTime();

		Console.WriteLine("Pack Hello");

		byte[] packed = hello.Pack();

		Console.WriteLine("Unpack Hello");

		Hello hello2 = new Hello(packed);

		Console.WriteLine(hello2);
	}

}
