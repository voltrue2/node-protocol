using System;
using System.Text;
using System.Collections.Generic;
using System.Net;

/* This is the sub struct of "hello" */

namespace NodeProtocol {

	public class World {

		// public constants
		public const uint ID = 3;
		public const string NAME = "world";
		// public properties
		public string SenderUid { get; set; }
		public string[] Recipients { get; set; }
		public string Message { get; set; }
		public NodeProtocol.Sample1 Sample { get; set; }
		public uint Timestamp { get; set; }

		// private properties
		private byte[] _2bytes = new byte[2];
		private byte[] _4bytes = new byte[4];


		public World(byte[] buf = null) {
			if (buf != null) {
				int offset = 0;
				
				// unpack string as SenderUid
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				Array.Reverse(_2bytes);
				offset += 2;
				int senderUidSize = (int)BitConverter.ToUInt16(_2bytes, 0);
				byte[] senderUidBytes = new byte[senderUidSize];
				Buffer.BlockCopy(buf, offset, senderUidBytes, 0, senderUidSize);
				offset += senderUidSize;
				SenderUid = Encoding.UTF8.GetString(senderUidBytes);
				// unpack recipients as array of string
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				Array.Reverse(_2bytes);
				offset += 2;
				int recipientsLength = (int)BitConverter.ToUInt16(_2bytes, 0);
				Recipients = new string[recipientsLength];
				int recipientsIndex = 0;
				for (recipientsIndex = 0; recipientsIndex < recipientsLength; recipientsIndex++) {
					// unpack string as Recipients
					Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
					Array.Reverse(_2bytes);
					offset += 2;
					int recipientsSize = (int)BitConverter.ToUInt16(_2bytes, 0);
					byte[] recipientsBytes = new byte[recipientsSize];
					Buffer.BlockCopy(buf, offset, recipientsBytes, 0, recipientsSize);
					offset += recipientsSize;
					Recipients[recipientsIndex] = Encoding.UTF8.GetString(recipientsBytes);
				}
				// unpack string as Message
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				Array.Reverse(_2bytes);
				offset += 2;
				int messageSize = (int)BitConverter.ToUInt16(_2bytes, 0);
				byte[] messageBytes = new byte[messageSize];
				Buffer.BlockCopy(buf, offset, messageBytes, 0, messageSize);
				offset += messageSize;
				Message = Encoding.UTF8.GetString(messageBytes);
				// Sample parameter: unpack Sample1 as Sample
				Buffer.BlockCopy(buf, offset, _2bytes, 0, 2);
				Array.Reverse(_2bytes);
				int sampleSize = (int)BitConverter.ToUInt16(_2bytes, 0);
				offset += 2;
				byte[] sampleBytes = new byte[sampleSize];
				Buffer.BlockCopy(buf, offset, sampleBytes, 0, sampleSize);
				Sample = new Sample1(sampleBytes);
				offset += sampleSize;
				// unpack Uint32 as Timestamp
				Buffer.BlockCopy(buf, offset, _4bytes, 0, 4);
				Array.Reverse(_4bytes);
				Timestamp = (uint)BitConverter.ToUInt32(_4bytes, 0);
				offset += 4;

			}
		}

		public byte[] Pack() {
			
			int totalBufSize = 0;
			// get byte size first: get byte size of string as SenderUid
			byte[] senderUidBytes = Encoding.UTF8.GetBytes(SenderUid);
			totalBufSize += 2 + senderUidBytes.Length;
			// Recipients is an array of string
			totalBufSize += 2;
			List<byte[]> recipientsPackByteList = new List<byte[]>();
			for (int recipientsIndex = 0, recipientsArrayLength = Recipients.Length; recipientsIndex < recipientsArrayLength; recipientsIndex++) {
				// get byte size first: get byte size of string as Recipients
				byte[] recipientsBytes = Encoding.UTF8.GetBytes(Recipients[recipientsIndex]);
				totalBufSize += 2 + recipientsBytes.Length;
				recipientsPackByteList.Add(recipientsBytes);
			}
			// get byte size first: get byte size of string as Message
			byte[] messageBytes = Encoding.UTF8.GetBytes(Message);
			totalBufSize += 2 + messageBytes.Length;
			// get byte size first: Sample parameter: get byte size of Sample1 as Sample
			/*** Sample ***/
			// get byte size first: Unique ID: get byte size of Uint32 as Sample.Id
			byte[] idBytes = BitConverter.GetBytes(Sample.Id);
			Array.Reverse(idBytes);
			totalBufSize += 4;
			// get byte size first: get byte size of string as Sample.Key
			byte[] keyBytes = Encoding.UTF8.GetBytes(Sample.Key);
			totalBufSize += 2 + keyBytes.Length;
			// get byte size first: Probably JSON: get byte size of string as Sample.Value
			byte[] valueBytes = Encoding.UTF8.GetBytes(Sample.Value);
			totalBufSize += 2 + valueBytes.Length;
			// get byte size first: get byte size of bool as Sample.Enabled
			int enabledBool = 0;
			if (Sample.Enabled == true) {
				enabledBool = 1;
			}
			byte[] enabledBytes = BitConverter.GetBytes(enabledBool);
			totalBufSize += 1;
			// Sample.Sample2list is an array of Sample2
			totalBufSize += 2;
			List<byte[]> sample2listPackByteList = new List<byte[]>();
			for (int sample2listIndex = 0, sample2listArrayLength = Sample.Sample2list.Length; sample2listIndex < sample2listArrayLength; sample2listIndex++) {
				// get byte size first: get byte size of Sample2 as Sample.Sample2list
				/*** Sample.Sample2list ***/
				// get byte size first: get byte size of string as Sample.Sample2list[sample2listIndex].Name
				byte[] nameBytes = Encoding.UTF8.GetBytes(Sample.Sample2list[sample2listIndex].Name);
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
			// get byte size first: get byte size of sbyte as Sample._eight
			byte[] _eightBytes = BitConverter.GetBytes(Sample._eight);
			totalBufSize += 1;
			// get byte size first: get byte size of short as Sample._sixteen
			byte[] _sixteenBytes = BitConverter.GetBytes(Sample._sixteen);
			totalBufSize += 2;
			// get byte size first: get byte size of int as Sample._thirtytwo
			byte[] _thirtytwoBytes = BitConverter.GetBytes(Sample._thirtytwo);
			totalBufSize += 4;
			// get byte size first: Date time object: get byte size of System.DateTime as Sample.Datetime
			double datetimeTime = (Sample.Datetime - new DateTime(1970, 1, 1)).TotalMilliseconds;
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
			// Sample.Sample2list is an array of Sample2
			_2bytes = BitConverter.GetBytes((ushort)Sample.Sample2list.Length);
			Array.Reverse(_2bytes);
			Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
			offset += 2;
			for (int sample2listIndex = 0, sample2listArrayLength = Sample.Sample2list.Length; sample2listIndex < sample2listArrayLength; sample2listIndex++) {
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
			// get byte size first: get byte size of Uint32 as Timestamp
			byte[] timestampBytes = BitConverter.GetBytes(Timestamp);
			Array.Reverse(timestampBytes);
			totalBufSize += 4;

			// create pack buffer
			byte[] buf = new byte[totalBufSize];
			int offset = 0;

			// pack string as SenderUid
			_2bytes = BitConverter.GetBytes((ushort)senderUidBytes.Length);
			Array.Reverse(_2bytes);
			Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
			offset += 2;
			Buffer.BlockCopy(senderUidBytes, 0, buf, offset, senderUidBytes.Length);
			// Recipients is an array of string
			_2bytes = BitConverter.GetBytes((ushort)Recipients.Length);
			Array.Reverse(_2bytes);
			Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
			offset += 2;
			for (int recipientsIndex = 0, recipientsArrayLength = Recipients.Length; recipientsIndex < recipientsArrayLength; recipientsIndex++) {
				// pack string as Recipients
				_2bytes = BitConverter.GetBytes((ushort)recipientsPackByteList[recipientsIndex].Length);
				Array.Reverse(_2bytes);
				Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
				offset += 2;
				Buffer.BlockCopy(recipientsPackByteList[recipientsIndex], 0, buf, offset, recipientsPackByteList[recipientsIndex].Length);
				offset += recipientsPackByteList[recipientsIndex].Length;
			}
			// pack string as Message
			_2bytes = BitConverter.GetBytes((ushort)messageBytes.Length);
			Array.Reverse(_2bytes);
			Buffer.BlockCopy(_2bytes, 0, buf, offset, 2);
			offset += 2;
			Buffer.BlockCopy(messageBytes, 0, buf, offset, messageBytes.Length);
			// Sample parameter: pack Sample1 as Sample

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
			// pack Uint32 as Timestamp
			Array.Reverse(timestampBytes);
			Buffer.BlockCopy(timestampBytes, 0, buf, offset, timestampBytes.Length);
			offset += 4;

			return buf;
		}

	}
}
