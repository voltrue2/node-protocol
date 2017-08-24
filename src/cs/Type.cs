using System;

namespace NodeBuffer {

	public static class Type {
	
		public const byte INT8 = 1;
		public const byte INT16 = 2;
		public const byte INT32 = 3;
		public const byte UINT8 = 11;
		public const byte UINT16 = 12;
		public const byte UINT32 = 13;
		public const byte DOUBLE = 14;
		public const byte BOOL = 16;
		public const byte STR = 20;
		public const byte BUF = 254;
		public const byte BIN = 255;
		/* we do NOT support object, null, and undefined in C# counter part
		public const byte NUL = 30;
		public const byte UNDEF = 31;
		public const byte OBJ = 40;
		*/
		public const byte UNKNOWN = 0;

		public static byte[] BUF_NAME() {
			return new byte[4] { 0x6e, 0x62, 0x75, 0x66 };
		}

		public static byte Get(bool val) {
			return BOOL;
		}

		public static byte Get(int val) {
			if (val < 0) {
				if (val >= -128) {
					return INT8;
				} else if (val >= -32768) {
					return INT16;
				}
				return INT32;
			}
			if (val <= 0xff) {
				return UINT8;
			} else if (val <= 0xffff) {
				return UINT16;
			} else if ((UInt32)val <= 0xffffffff) {
				return UINT32;
			}
			return DOUBLE;
		}
	
		public static byte Get(double val) {
			if (val <= 0xffffffff && val >= 0) {
				return UINT32;
			}
			return DOUBLE;
		}

		public static byte Get(string val) {
			return STR;
		}

		public static byte Get(byte[] val) {
			byte[] b = new byte[4];
			// "nbuf"
			byte[] n = BUF_NAME();
			Buffer.BlockCopy(val, 0, b, 0, 4);	
			// .NET 3.5+ may not be available...
			if (b[0] == n[0] && b[1] == n[1] && b[2] == n[2] && b[3] == n[3]) {
				return BUF;
			}
			return BIN;
		}

	}

}
