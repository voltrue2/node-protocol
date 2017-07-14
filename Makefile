PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

## Set default command of make to help, so that running make will output help texts
.DEFAULT_GOAL := help

run: ## Executes compiled .exe file
	mono test/build/test.exe

build: ## Build C# code: generate protocol and compile
	node index.js test/samples/ test/proto/ templates/
	mcs -main:Test -out:test/build/test.exe test/proto/cs/hello.cs test/proto/cs/world.cs test/proto/cs/sample1.cs test/proto/cs/sample2.cs test/Test.cs

compile: ## Compile C# code
	mcs -main:Test -out:test/build/test.exe test/proto/cs/hello.cs test/proto/cs/world.cs test/proto/cs/sample1.cs test/proto/cs/sample2.cs test/Test.cs

gen: ## Generate protocol code
	node index.js test/samples/ test/proto/ templates/
