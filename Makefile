.PHONY: help download extract-dmg extract-asar extract-all repack launch test clean

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

download: ## Download Electron 22.3.9 for linux-x64
	bash scripts/download-electron.sh

extract-dmg: ## Extract app.asar + native modules from macOS DMG
	bash scripts/extract-dmg.sh

extract-asar: ## Extract app.asar contents
	bash scripts/extract-asar.sh

extract-all: extract-dmg extract-asar ## Full extraction pipeline

repack: ## Repack app-extracted/ back to app.asar
	bash scripts/repack-asar.sh

launch: ## Launch Zalo with Linux Electron
	bash electron-launcher.sh

test: ## Run all tests
	@bash test/smoke-test.sh && bash test/test-download-electron.sh && \
	 bash test/test-extract-dmg.sh && bash test/test-launcher.sh && \
	 echo "=== All tests passed ==="

clean: ## Remove build artifacts
	rm -rf build/electron-v* build/app.asar build/app-extracted build/native build/zalo-macOS
