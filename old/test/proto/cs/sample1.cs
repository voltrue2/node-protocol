using System;
using System.Text;
using System.Collections.Generic;
using System.Net;

namespace NodeProtocol {

	public class Sample1 {

		// public constants
		public const uint ID = 0;
		public const string NAME = "sample1";
		// public properties
		public uint Id { get; set; }
		public string Key { get; set; }
		public string Value { get; set; }
		public bool Enabled { get; set; }
		public NodeProtocol.Sample2[] Sample2list { get; set; }
		public sbyte _eight { get; set; }
		public short _sixteen { get; set; }
		public int _thirtytwo { get; set; }
		public System.DateTime Datetime { get; set; }

		// private properties
		private byte[] _4bytes = new byte[4];
		private byte[] _2bytes = new byte[2];
		private byte[] _8bytes = new byte[8];


		public Sample1(byte[] buf = null) {
			if (buf != null) {
				int offset = 0;
				
				// Unique ID: unpack Uint32 as Id
				Buffer.BlockCopy(buf, offset, _4bytes, 0, 4);
				Array.Reverse(_4bytes);
				Id = (uint)BitConverter.ToUInt32(_4bytes, 0);
				offset += 4;
				// unpack string as Key
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				Array.Reverse(_2bytes);
				offset += 2;
				int keySize = (int)BitConverter.ToUInt16(_2bytes, 0);
				byte[] keyBytes = new byte[keySize];
				Buffer.BlockCopy(buf, offset, keyBytes, 0, keySize);
				offset += keySize;
				Key = Encoding.UTF8.GetString(keyBytes);
				// Probably JSON: unpack string as Value
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				Array.Reverse(_2bytes);
				offset += 2;
				int valueSize = (int)BitConverter.ToUInt16(_2bytes, 0);
				byte[] valueBytes = new byte[valueSize];
				Buffer.BlockCopy(buf, offset, valueBytes, 0, valueSize);
				offset += valueSize;
				Value = Encoding.UTF8.GetString(valueBytes);
				// unpack bool as Enabled
				bool enabledBool = false;
				byte enabledValue = (byte)buf[offset];
				if (enabledValue == 1) {
					enabledBool = true;
				}
				Enabled = enabledBool;
				offset += 1;
				// unpack sample2list as array of sample2
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				Array.Reverse(_2bytes);
				offset += 2;
				int sample2listLength = (int)BitConverter.ToUInt16(_2bytes, 0);
				Sample2list = new Sample2[sample2listLength];
				int sample2listIndex = 0;
				for (sample2listIndex = 0; sample2listIndex < sample2listLength; sample2listIndex++) {
					// unpack Sample2 as Sample2list
					Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
					Array.Reverse(_2bytes);
					int sample2listSize = (int)BitConverter.ToUInt16(_2bytes, 0);
					offset += 2;
					byte[] sample2listBytes = new byte[sample2listSize];
					Buffer.BlockCopy(buf, offset, sample2listBytes, 0, sample2listSize);
					Sample2list[sample2listIndex] = new Sample2(sample2listBytes);
					offset += sample2listSize;
				}
				// unpack sbyte as _eight
				_eight = (sbyte)buf[offset];
				offset++;
				// unpack short as _sixteen
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				_sixteen = (short)BitConverter.ToInt16(_2bytes, 0);
				offset += 2;
				// unpack int as _thirtytwo
				Buffer.BlockCopy(buf, offset, _4bytes, 0, 4);
				_thirtytwo = (int)BitConverter.ToInt32(_4bytes, 0);
				offset += 4;
				// Date time object: unpack System.DateTime as Datetime
				Buffer.BlockCopy(buf, offset, _8bytes, 0, 8);
				Array.Reverse(_8bytes);
				TimeSpan datetimeTime = TimeSpan.FromMilliseconds(BitConverter.ToDouble(_8bytes, 0));
				Datetime = new DateTime(1970, 1, 1) +  datetimeTime;
				offset += 8;

			}
		}

		public byte[] Pack() {
			
			int totalBufSize = 0;
			// get byte size first: Unique ID: get byte size of Uint32 as Id
			byte[] idBytes = BitConverter.GetBytes(Id);
			Array.Reverse(idBytes);
			totalBufSize += 4;
			// get byte size first: get byte size of string as Key
			byte[] keyBytes = Encoding.UTF8.GetBytes(Key);
			totalBufSize += 2 + keyBytes.Length;
			// get byte size first: Probably JSON: get byte size of string as Value
			byte[] valueBytes = Encoding.UTF8.GetBytes(Value);
			totalBufSize += 2 + valueBytes.Length;
			// get byte size first: get byte size of bool as Enabled
			int enabledBool = 0;
			if (Enabled == true) {
				enabledBool = 1;
			}
			byte[] enabledBytes = BitConverter.GetBytes(enabledBool);
			totalBufSize += 1;
			// Sample2list is an array of Sample2
			totalBufSize += 2;
			List<byte[]> sample2listPackByteList = new List<byte[]>();
			for (int sample2listIndex = 0, sample2listArrayLength = Sample2list.Length; sample2listIndex < sample2listArrayLength; sample2listIndex++) {
				// get byte size first: get byte size of Sample2 as Sample2list
				/*** Sample2list ***/
				// get byte size first: get byte size of string as Sample2list[sample2listIndex].Name
				byte[] nameBytes = Encoding.UTF8.GetBytes(Sample2list[sample2listIndex].Name);
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
				sample2listPackByteList.Add(sample2listBytes);
			}
			// get byte size first: get byte size of sbyte as _eight
			byte[] _eightBytes = BitConverter.GetBytes(_eight);
			totalBufSize += 1;
			// get byte size first: get byte size of short as _sixteen
			byte[] _sixteenBytes = BitConverter.GetBytes(_sixteen);
			totalBufSize += 2;
			// get byte size first: get byte size of int as _thirtytwo
			byte[] _thirtytwoBytes = BitConverter.GetBytes(_thirtytwo);
			totalBufSize += 4;
			// get byte size first: Date time object: get byte size of System.DateTime as Datetime
			double datetimeTime = (Datetime - new DateTime(1970, 1, 1)).TotalMilliseconds;
			byte[] datetimeBytes = BitConverter.GetBytes((double)datetimeTime);
			Array.Reverse(datetimeBytes);
			totalBufSize += 8;

			// create pack buffer
			byte[] buf = new byte[totalBufSize];
			int offset = 0;

			// Unique ID: pack Uint32 as Id
			Array.Reverse(idBytes);
			Buffer.BlockCopy(idBytes, 0, buf, offset, idBytes.Length);
			offset += 4;
			// pack string as Key
			_2bytes = BitConverter.GetBytes((ushort)keyBytes.Length);
			Array.Reverse(_2bytes);
			Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
			offset += 2;
			Buffer.BlockCopy(keyBytes, 0, buf, offset, keyBytes.Length);
			// Probably JSON: pack string as Value
			_2bytes = BitConverter.GetBytes((ushort)valueBytes.Length);
			Array.Reverse(_2bytes);
			Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
			offset += 2;
			Buffer.BlockCopy(valueBytes, 0, buf, offset, valueBytes.Length);
			// pack bool as Enabled
			Buffer.BlockCopy(enabledBytes, 0, buf, offset, enabledBytes.Length);
			offset += 1;
			// Sample2list is an array of Sample2
			_2bytes = BitConverter.GetBytes((ushort)Sample2list.Length);
			Array.Reverse(_2bytes);
			Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
			offset += 2;
			for (int sample2listIndex = 0, sample2listArrayLength = Sample2list.Length; sample2listIndex < sample2listArrayLength; sample2listIndex++) {
				// pack Sample2 as Sample2list

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
			}
			// pack sbyte as _eight
			Buffer.BlockCopy(_eightBytes, 0, buf, offset, _eightBytes.Length);
			offset += 1;
			// pack short as _sixteen
			Buffer.BlockCopy(_sixteenBytes, 0, buf, offset, _sixteenBytes.Length);
			offset += 2;
			// pack int as _thirtytwo
			Buffer.BlockCopy(_thirtytwoBytes, 0, buf, offset, _thirtytwoBytes.Length);
			offset += 4;
			// Date time object: pack System.DateTime as Datetime
			Array.Reverse(datetimeBytes);
			Buffer.BlockCopy(datetimeBytes, 0, buf, offset, datetimeBytes.Length);
			offset += 8;

			return buf;
		}

	}
}
