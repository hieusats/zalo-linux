#include <node_api.h>
#include <string>
#include <vector>
#include <cstring>
#include <fstream>
#include <sstream>
#include <algorithm>
#include <iomanip>

extern "C" {
#include <openssl/evp.h>
#include <openssl/md5.h>
}

static const char* KDF_PASSWORD = "zpf_zd@2025";
static const char* KDF_SALT = "zp";
static const int KDF_ITERATIONS = 10000;
static const int KEY_LENGTH = 32;
static const int IV_LENGTH = 16;

static const std::vector<uint8_t> DEFAULT_IV = {
    155, 72, 37, 195, 9, 217, 80, 42,
    145, 102, 171, 75, 214, 176, 134, 18
};

static bool deriveKey(const std::string& password, const std::string& salt,
                      uint8_t* keyOut, int keyLen) {
    return PKCS5_PBKDF2_HMAC(password.c_str(), static_cast<int>(password.length()),
                             reinterpret_cast<const unsigned char*>(salt.c_str()),
                             static_cast<int>(salt.length()),
                             KDF_ITERATIONS, EVP_sha256(), keyLen, keyOut) == 1;
}

static bool aes256CbcDecrypt(const uint8_t* ciphertext, int ciphertextLen,
                              const uint8_t* key, const uint8_t* iv,
                              std::vector<uint8_t>& plaintext) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    if (!ctx) return false;

    int ret = 1;
    int len = 0;
    int plaintextLen = 0;

    if (EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), nullptr, key, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        return false;
    }

    plaintext.resize(ciphertextLen + EVP_CIPHER_block_size(EVP_aes_256_cbc()));

    if (EVP_DecryptUpdate(ctx, plaintext.data(), &len,
                          ciphertext, ciphertextLen) != 1) {
        ret = 0;
    }
    plaintextLen = len;

    if (ret == 1 && EVP_DecryptFinal_ex(ctx, plaintext.data() + len, &len) != 1) {
        ret = 0;
    }
    plaintextLen += len;
    plaintext.resize(plaintextLen);

    EVP_CIPHER_CTX_free(ctx);
    return ret == 1;
}

static std::vector<uint8_t> lzmaDecompressFile(const std::string& inputPath) {
    std::vector<uint8_t> output;
    std::string cmd = "lzma -dc '" + inputPath + "' 2>/dev/null";

    FILE* pipe = popen(cmd.c_str(), "r");
    if (!pipe) return output;

    char buffer[8192];
    size_t bytesRead;
    while ((bytesRead = fread(buffer, 1, sizeof(buffer), pipe)) > 0) {
        output.insert(output.end(), buffer, buffer + bytesRead);
    }

    pclose(pipe);
    return output;
}

static std::vector<uint8_t> readFile(const std::string& path) {
    std::ifstream file(path, std::ios::binary | std::ios::ate);
    if (!file.is_open()) return {};

    auto size = file.tellg();
    file.seekg(0, std::ios::beg);

    std::vector<uint8_t> buffer(static_cast<size_t>(size));
    if (!file.read(reinterpret_cast<char*>(buffer.data()), size)) {
        return {};
    }
    return buffer;
}

static bool writeFile(const std::string& path, const uint8_t* data, int dataLen) {
    std::ofstream file(path, std::ios::binary);
    if (!file.is_open()) return false;
    file.write(reinterpret_cast<const char*>(data), dataLen);
    return file.good();
}

static bool decryptAndDecompressDb(const std::string& inputPath,
                                    const std::string& outputPath,
                                    const std::string& userKey,
                                    bool useV2) {
    std::vector<uint8_t> fileData = readFile(inputPath);
    if (fileData.empty()) {
        fprintf(stderr, "Cannot read input file: %s\n", inputPath.c_str());
        return false;
    }

    uint8_t key[KEY_LENGTH];
    std::string effectivePassword = userKey.empty() ? KDF_PASSWORD : userKey;

    if (!deriveKey(effectivePassword, KDF_SALT, key, KEY_LENGTH)) {
        fprintf(stderr, "Key derivation failed\n");
        return false;
    }

    std::vector<uint8_t> decrypted;
    if (!aes256CbcDecrypt(fileData.data(), static_cast<int>(fileData.size()),
                          key, DEFAULT_IV.data(), decrypted)) {
        fprintf(stderr, "Decryption failed\n");
        return false;
    }

    if (useV2) {
        std::vector<uint8_t> decompressed = lzmaDecompressFile(inputPath);
        if (!decompressed.empty()) {
            decrypted = decompressed;
        }
    }

    if (!writeFile(outputPath, decrypted.data(), static_cast<int>(decrypted.size()))) {
        fprintf(stderr, "Cannot write output file: %s\n", outputPath.c_str());
        return false;
    }

    return true;
}

static napi_value DecompressAndDecryptDb(napi_env env, napi_callback_info info) {
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    if (argc < 3) {
        napi_throw_error(env, nullptr, "Expected 3 arguments: inputPath, outputPath, key");
        return nullptr;
    }

    char inputPath[1024] = {0};
    char outputPath[1024] = {0};
    char key[256] = {0};

    size_t len;
    napi_get_value_string_utf8(env, args[0], inputPath, sizeof(inputPath), &len);
    napi_get_value_string_utf8(env, args[1], outputPath, sizeof(outputPath), &len);
    napi_get_value_string_utf8(env, args[2], key, sizeof(key), &len);

    bool result = decryptAndDecompressDb(inputPath, outputPath, key, false);

    napi_value ret;
    napi_get_boolean(env, result, &ret);
    return ret;
}

static napi_value DecompressAndDecryptDb_V2(napi_env env, napi_callback_info info) {
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    if (argc < 3) {
        napi_throw_error(env, nullptr, "Expected 3 arguments: inputPath, outputPath, key");
        return nullptr;
    }

    char inputPath[1024] = {0};
    char outputPath[1024] = {0};
    char key[256] = {0};

    size_t len;
    napi_get_value_string_utf8(env, args[0], inputPath, sizeof(inputPath), &len);
    napi_get_value_string_utf8(env, args[1], outputPath, sizeof(outputPath), &len);
    napi_get_value_string_utf8(env, args[2], key, sizeof(key), &len);

    bool result = decryptAndDecompressDb(inputPath, outputPath, key, true);

    napi_value ret;
    napi_get_boolean(env, result, &ret);
    return ret;
}

static napi_value GetVersion(napi_env env, napi_callback_info info) {
    napi_value version;
    napi_create_string_utf8(env, "4.0.0-linux", NAPI_AUTO_LENGTH, &version);
    return version;
}

static napi_value ParseBinNet(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    if (argc < 1) {
        napi_throw_error(env, nullptr, "Expected 1 argument: buffer");
        return nullptr;
    }

    bool isBuffer = false;
    napi_is_buffer(env, args[0], &isBuffer);

    if (!isBuffer) {
        napi_value nullVal;
        napi_get_null(env, &nullVal);
        return nullVal;
    }

    uint8_t* data = nullptr;
    size_t dataLen = 0;
    napi_get_buffer_info(env, args[0], reinterpret_cast<void**>(&data), &dataLen);

    if (dataLen < 4) {
        napi_value nullVal;
        napi_get_null(env, &nullVal);
        return nullVal;
    }

    napi_value result;
    napi_create_object(env, &result);

    int32_t cliMsgId = static_cast<int32_t>(data[0]) |
                       (static_cast<int32_t>(data[1]) << 8) |
                       (static_cast<int32_t>(data[2]) << 16) |
                       (static_cast<int32_t>(data[3]) << 24);
    napi_value cliMsgIdVal;
    napi_create_int32(env, cliMsgId, &cliMsgIdVal);
    napi_set_named_property(env, result, "cliMsgId", cliMsgIdVal);

    napi_value lengthVal;
    napi_create_int32(env, static_cast<int32_t>(dataLen), &lengthVal);
    napi_set_named_property(env, result, "length", lengthVal);

    return result;
}

static napi_value Init(napi_env env, napi_value exports) {
    napi_value fn;

    napi_create_function(env, "decompressAndDecryptDb", NAPI_AUTO_LENGTH,
                         DecompressAndDecryptDb, nullptr, &fn);
    napi_set_named_property(env, exports, "decompressAndDecryptDb", fn);

    napi_create_function(env, "decompressAndDecryptDb_V2", NAPI_AUTO_LENGTH,
                         DecompressAndDecryptDb_V2, nullptr, &fn);
    napi_set_named_property(env, exports, "decompressAndDecryptDb_V2", fn);

    napi_create_function(env, "getVersion", NAPI_AUTO_LENGTH,
                         GetVersion, nullptr, &fn);
    napi_set_named_property(env, exports, "getVersion", fn);

    napi_create_function(env, "parseBinNet", NAPI_AUTO_LENGTH,
                         ParseBinNet, nullptr, &fn);
    napi_set_named_property(env, exports, "parseBinNet", fn);

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
