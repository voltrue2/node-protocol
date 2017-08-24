using System;
using System.Text;
using System.Collections.Generic;
using System.IO;

namespace NodeBuffer {

	public class Parsed {

		private List<object> _parsed = new List<object>();
		private byte[] _schema;
		private byte[] _2b = new byte[2];
		private byte[] _4b = new byte[4];
		private byte[] _8b = new byte[8];

		public Parsed(byte[] buf, int offset, byte[] schema) {
			_schema = schema;
			for (int i = 0, len = schema.Length; i < len; i++) {
				byte type = schema[i];
				switch (type) {
					case NodeBuffer.Type.INT8:
						Buffer.BlockCopy(buf, offset, _4b, 0, 4);
						offset += 1;
						_parsed.Add((sbyte)BitConverter.ToInt32(_4b, 0));
						break;
					case NodeBuffer.Type.UINT8:
						Buffer.BlockCopy(buf, offset, _4b, 0, 4);
						offset += 1;
						_parsed.Add((byte)BitConverter.ToUInt32(_4b, 0));
						break;
					case NodeBuffer.Type.INT16:
						Buffer.BlockCopy(buf, offset, _2b, 0, 2);
						offset += 2;
						Array.Reverse(_2b);
						_parsed.Add((short)BitConverter.ToInt16(_2b, 0));
						break;
					case NodeBuffer.Type.UINT16:
						Buffer.BlockCopy(buf, offset, _2b, 0, 2);
						offset += 2;
						Array.Reverse(_2b);
						_parsed.Add((ushort)BitConverter.ToUInt16(_2b, 0));
						break;
					case NodeBuffer.Type.INT32:
						Buffer.BlockCopy(buf, offset, _4b, 0, 4);
						offset += 4;
						Array.Reverse(_4b);
						_parsed.Add((Int32)BitConverter.ToInt32(_4b, 0));
						break;
					case NodeBuffer.Type.UINT32:
						Buffer.BlockCopy(buf, offset, _4b, 0, 4);
						offset += 4;
						Array.Reverse(_4b);
						_parsed.Add((UInt32)BitConverter.ToUInt32(_4b, 0));
						break;
					case NodeBuffer.Type.DOUBLE:
						Buffer.BlockCopy(buf, offset, _8b, 0, 8);
						offset += 8;
						Array.Reverse(_8b);
						_parsed.Add((double)BitConverter.ToDouble(_8b, 0));
						break;
					case NodeBuffer.Type.BOOL:
						Buffer.BlockCopy(buf, offset, _4b, 0, 4);
						offset += 1;
						byte boolVal = (byte)BitConverter.ToInt32(_4b, 0);
						if (boolVal == 1) {
							_parsed.Add(true);
						} else {
							_parsed.Add(false);
						}
						break;
					case NodeBuffer.Type.STR:
						Buffer.BlockCopy(buf, offset, _2b, 0, 2);
						offset += 2;
						Array.Reverse(_2b);
						ushort strSize = BitConverter.ToUInt16(_2b, 0);
						byte[] strBuf = new byte[strSize];
						Buffer.BlockCopy(buf, offset, strBuf, 0, strSize);
						offset += strSize;
						_parsed.Add(Encoding.UTF8.GetString(strBuf));
						break;
					case NodeBuffer.Type.BIN:
						Buffer.BlockCopy(buf, offset, _2b, 0, 2);
						offset += 2;
						Array.Reverse(_2b);
						ushort binSize = BitConverter.ToUInt16(_2b, 0);
						byte[] bin = new byte[binSize];
						Buffer.BlockCopy(buf, offset, bin, 0, binSize);
						offset += binSize;
						_parsed.Add(bin);
						break;
					case NodeBuffer.Type.BUF:
						Buffer.BlockCopy(buf, offset, _2b, 0, 2);
						offset += 2;
						Array.Reverse(_2b);
						ushort _bufSize = BitConverter.ToUInt16(_2b, 0);
						byte[] _buf = new byte[_bufSize];
						Buffer.BlockCopy(buf, offset, _buf, 0, _bufSize);
						offset += _bufSize;
						_parsed.Add(NodeBuffer.Buf.Parse(_buf));
						break;
				}
			}
		}

		public sbyte GetAsInt8(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.INT8) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (sbyte)_parsed[index];
		}

		public byte GetAsUInt8(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.UINT8) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (byte)_parsed[index];
		}

		public short GetAsInt16(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.INT16) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (short)_parsed[index];
		}

		public ushort GetAsUInt16(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.UINT16) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (ushort)_parsed[index];
		}

		public Int32 GetAsInt32(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.INT32) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (Int32)_parsed[index];
		}

		public UInt32 GetAsUInt32(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.UINT32) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (UInt32)_parsed[index];
		}

		public double GetAsDouble(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.DOUBLE) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (double)_parsed[index];
		}

		public string GetAsString(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.STR) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (string)_parsed[index];
		}

		public bool GetAsBool(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.BOOL) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (bool)_parsed[index];
		}

		public byte[] GetAsBytes(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.BIN) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (byte[])_parsed[index];
		}

		public NodeBuffer.Parsed GetAsParsed(int index) {
			byte type = _schema[index];
			if (type != NodeBuffer.Type.BUF) {
				throw new ArgumentException("Value asked for is " + GetTypeName(type));
			}
			return (NodeBuffer.Parsed)_parsed[index];
		}

		private string GetTypeName(byte type) {
			switch (type) {
				case NodeBuffer.Type.INT8:
					return "Int8";
				case NodeBuffer.Type.UINT8:
					return "UInt8";
				case NodeBuffer.Type.INT16:
					return "Int16";
				case NodeBuffer.Type.UINT16:
					return "UInt16";
				case NodeBuffer.Type.INT32:
					return "Int32";
				case NodeBuffer.Type.UINT32:
					return "UInt32";
				case NodeBuffer.Type.DOUBLE:
					return "double";
				case NodeBuffer.Type.BOOL:
					return "bool";
				case NodeBuffer.Type.STR:
					return "string";
				case NodeBuffer.Type.BIN:
					return "byte[]";
				case NodeBuffer.Type.BUF:
					return "NodeBuffer.Parsed";
				default:
					return "Unknown";
			}
		}

	}
	
	public class Buf {
		
		private const int MAX_BUF_SIZE = 8000;
		private const int MAX_SCHEMA_SIZE = 100;		

		private byte[] _buf = new byte[MAX_BUF_SIZE];
		private ushort _bpos = 0;
		private byte[] _schema = new byte[MAX_SCHEMA_SIZE];
		private ushort _spos = 0;
		private bool _lock = false;

		private byte[] _1b = new byte[1];
		private byte[] _2b = new byte[2];
		private byte[] _4b = new byte[4];
		private byte[] _8b = new byte[8];

		public static Parsed Parse(byte[] buf) {
			// skip the first 4 bytes (buffer name)
			int offset = 4;
			// parse schema: it is an array of uint8
			byte[] schema = _GetSchema(buf, ref offset);
			// parse payload buffer
			NodeBuffer.Parsed parsed = new NodeBuffer.Parsed(buf, offset, schema);
			return parsed;
		}

		private static byte[] _GetSchema(byte[] buf, ref int offset) {
			// it actually is UInt8 not UInt32...
			byte[] sizeBytes = new byte[4];
			Buffer.BlockCopy(buf, offset, sizeBytes, 0, 4);
			byte size = (byte)BitConverter.ToUInt32(sizeBytes, 0);
			offset += 1;
			byte[] schema = new byte[(int)size];
			byte[] typeBytes = new byte[4];
			int len = (int)size;
			for (int i = 0; i < len; i++) {
				Buffer.BlockCopy(buf, offset, typeBytes, 0, 1);
				byte type = (byte)BitConverter.ToUInt32(typeBytes, 0);
				offset += 1;
				schema[i] = type;
			}
			return schema;
		}

		public bool Add(int val) {
			if (_lock) {
				return false;
			}
			// add to schema
			byte type = NodeBuffer.Type.Get(val);
			_1b = BitConverter.GetBytes(type);
			Buffer.BlockCopy(_1b, 0, _schema, _spos, 1);
			_spos += 1;
			// add val to payload buf
			switch (type) {
				case NodeBuffer.Type.INT8:
				case NodeBuffer.Type.UINT8:
					_1b = BitConverter.GetBytes(val);
					Buffer.BlockCopy(_1b, 0, _buf, _bpos, 1);
					_bpos += 1;
					break;
				case NodeBuffer.Type.INT16:
					_2b = BitConverter.GetBytes((short)val);
					// big endian
					Array.Reverse(_2b);
					Buffer.BlockCopy(_2b, 0, _buf, _bpos, 2);
					_bpos += 2;
					break;
				case NodeBuffer.Type.UINT16:
					_2b = BitConverter.GetBytes((ushort)val);
					// big endian
					Array.Reverse(_2b);
					Buffer.BlockCopy(_2b, 0, _buf, _bpos, 2);
					_bpos += 2;
					break;
				case NodeBuffer.Type.INT32:
				case NodeBuffer.Type.UINT32:
					_4b = BitConverter.GetBytes(val);
					// big endian
					Array.Reverse(_4b);
					Buffer.BlockCopy(_4b, 0, _buf, _bpos, 4);
					_bpos += 4;
					break;
			}
			return true;
		}

		public bool Add(double val) {
			if (_lock) {
				return false;
			}
			// add to schema
			byte type = NodeBuffer.Type.Get(val);
			_1b = BitConverter.GetBytes(type);
			Buffer.BlockCopy(_1b, 0, _schema, _spos, 1);
			_spos += 1;
			// add val to payload buf
			if (type == NodeBuffer.Type.UINT32) {
				_4b = BitConverter.GetBytes((UInt32)val);
				// big endian
				Array.Reverse(_4b);
				Buffer.BlockCopy(_4b, 0, _buf, _bpos, 4);
				_bpos += 4;
			} else {
				_8b = BitConverter.GetBytes(val);
				// big endian
				Array.Reverse(_8b);
				Buffer.BlockCopy(_8b, 0, _buf, _bpos, 8);
				_bpos += 8;
			}
			return true;
		}

		public bool Add(bool val) {
			if (_lock) {
				return false;
			}
			// add to schema
			byte type = NodeBuffer.Type.Get(val);
			_1b = BitConverter.GetBytes(type);
			Buffer.BlockCopy(_1b, 0, _schema, _spos, 1);
			_spos += 1;
			// add val to payload buf
			// convert bool to byte
			byte _bool = 0;
			if (val == true) {
				_bool = 1;
			}
			_1b = BitConverter.GetBytes(_bool);
			Buffer.BlockCopy(_1b, 0, _buf, _bpos, 1);
			_bpos += 1;
			return true;
		}

		public bool Add(byte[] val) {
			if (_lock) {
				return false;
			}
			// add to schema
			byte type = NodeBuffer.Type.Get(val);
			_1b = BitConverter.GetBytes(type);
			Buffer.BlockCopy(_1b, 0, _schema, _spos, 1);
			_spos += 1;
			// add val to payload buf
			_2b = BitConverter.GetBytes((ushort)val.Length);
			// big endian
			Array.Reverse(_2b);
			Buffer.BlockCopy(_2b, 0, _buf, _bpos, 2);
			_bpos += 2;
			Buffer.BlockCopy(val, 0, _buf, _bpos, val.Length);
			_bpos += (ushort)val.Length;
			return true;
		}

		public bool Add(string val) {
			if (_lock) {
				return false;
			}
			// add to schema
			byte type = NodeBuffer.Type.Get(val);
			_1b = BitConverter.GetBytes(type);
			Buffer.BlockCopy(_1b, 0, _schema, _spos, 1);
			_spos += 1;
			// add val to payload buf
			byte[] str = Encoding.UTF8.GetBytes(val);
			_2b = BitConverter.GetBytes((ushort)str.Length);
			// big endian
			Array.Reverse(_2b);
			Buffer.BlockCopy(_2b, 0, _buf, _bpos, 2);
			_bpos += 2;
			Buffer.BlockCopy(str, 0, _buf, _bpos, str.Length);
			_bpos += (ushort)str.Length;
			return true;
		}

		public byte[] Finalize() {
			if (_lock) {
				return null;
			}
			_lock = true;
			// fix the size of _schema and _buf
			byte[] schema = Splice(_schema, 0, _spos);
			byte[] buf = Splice(_buf, 0, _bpos);	
			// 4 bytes: BUF_NAME 1 byte: _schema.Length
			byte[] res = new byte[4 + 1 + schema.Length + buf.Length];
			// copy BUF_NAME
			Buffer.BlockCopy(NodeBuffer.Type.BUF_NAME(), 0, res, 0, 4);
			// copy schema size
			_1b = BitConverter.GetBytes((byte)schema.Length);
			Buffer.BlockCopy(_1b, 0, res, 4, 1);
			// copy schema
			Buffer.BlockCopy(schema, 0, res, 5, schema.Length);
			// copy buf
			Buffer.BlockCopy(buf, 0, res, 5 + schema.Length, buf.Length);
			return res;
		}

		private byte[] Splice(byte[] bytes, int index, int len) {
			byte[] res = new byte[len];
			Array.Copy(bytes, index, res, 0, len);
			return res;
		}

	}

}
