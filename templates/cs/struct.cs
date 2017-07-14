using System;
using System.Text;
using System.Collections.Generic;
using System.Net;
{{ desc(description) }}
namespace NodeProtocol {

	public class {{ className(name) }} {

		// public constants
		public const uint ID = {{ index }};
		public const string NAME = "{{ name }}";
		// public properties
		{{ getPropsCs(params) }}
		// private properties
		{{ getByteProps(params) }}

		public {{ className(name) }}(byte[] buf = null) {
			if (buf != null) {
				int offset = 0;
				{{ getUnpackCs(params) }}
			}
		}

		public byte[] Pack() {
			{{ getPackCs(params) }}
			return buf;
		}

	}
}
