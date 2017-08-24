using System;
using System.Text;
using System.Collections.Generic;
using System.Net;

namespace NodeProtocol {

	public class Sample2 {

		// public constants
		public const uint ID = 1;
		public const string NAME = "sample2";
		// public properties
		public string Name { get; set; }

		// private properties
		private byte[] _2bytes = new byte[2];


		public Sample2(byte[] buf = null) {
			if (buf != null) {
				int offset = 0;
				
				// unpack string as Name
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				Array.Reverse(_2bytes);
				offset += 2;
				int nameSize = (int)BitConverter.ToUInt16(_2bytes, 0);
				byte[] nameBytes = new byte[nameSize];
				Buffer.BlockCopy(buf, offset, nameBytes, 0, nameSize);
				offset += nameSize;
				Name = Encoding.UTF8.GetString(nameBytes);

			}
		}

		public byte[] Pack() {
			
			int totalBufSize = 0;
			// get byte size first: get byte size of string as Name
			byte[] nameBytes = Encoding.UTF8.GetBytes(Name);
			totalBufSize += 2 + nameBytes.Length;

			// create pack buffer
			byte[] buf = new byte[totalBufSize];
			int offset = 0;

			// pack string as Name
			_2bytes = BitConverter.GetBytes((ushort)nameBytes.Length);
			Array.Reverse(_2bytes);
			Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
			offset += 2;
			Buffer.BlockCopy(nameBytes, 0, buf, offset, nameBytes.Length);

			return buf;
		}

	}
}
