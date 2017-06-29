using System;
using System.IO;

namespace NodeProtocol {

	public class Packer {
		
		// type size = 1 + key size = 4 is minimum
		private const int MIN_LEN = 1 + 4;
		private const int INT8LEN = 1;
		private const int INT16LEN = 2;
		private const int INT32LEN = 4;
		private const int FLOATLEN = 4;
		private const int DOUBLELEN = 8;

		public Packer {
			
		}

	}

}
