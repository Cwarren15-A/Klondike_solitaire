# Security Documentation

## 🔒 API Key Security

This project implements several security measures to protect your OpenAI API key:

### ✅ **Security Measures Implemented:**

1. **No Hardcoded Keys**: API keys are never stored in source code
2. **Local Storage Only**: Keys are stored locally in the user's browser
3. **Base64 Obfuscation**: Keys are encoded (not encrypted, but better than plaintext)
4. **User Prompt**: Users must manually enter their own API key
5. **Secure Input**: API key input uses password field type
6. **Optional Usage**: Users can skip OpenAI features entirely

### 🛡️ **GitHub Protection:**

- **`.gitignore`** configured to exclude sensitive files
- **No API keys** in repository
- **No secrets** in commit history
- **Safe for public repositories**

### 🔐 **How It Works:**

1. **First Time**: User is prompted to enter their OpenAI API key
2. **Storage**: Key is base64 encoded and stored in localStorage
3. **Retrieval**: Key is decoded when needed for API calls
4. **Security**: Key never appears in source code or git history

### ⚠️ **Important Notes:**

- **Your API key is YOUR responsibility**
- **Never share your API key with others**
- **Monitor your OpenAI usage and billing**
- **Revoke keys if compromised**

### 🚫 **What's NOT Stored in Git:**

- API keys
- Secrets
- Tokens
- Personal configuration files
- Logs with sensitive data

### 📋 **Best Practices:**

1. **Regular Key Rotation**: Change your API key periodically
2. **Usage Monitoring**: Check your OpenAI dashboard regularly
3. **Rate Limiting**: Built-in 1-second delays between requests
4. **Error Handling**: Graceful fallback to local AI if OpenAI fails

### 🔄 **Model Information:**

- **Model Used**: `gpt-4o-mini`
- **Purpose**: Game analysis and strategic advice
- **Rate Limits**: Respects OpenAI's rate limiting
- **Fallback**: Local AI continues to work if OpenAI is unavailable

## 🆘 **If Your Key is Compromised:**

1. **Immediately revoke** the key at [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Generate a new key**
3. **Clear browser storage** (localStorage)
4. **Re-enter the new key** in the game

## 📞 **Support:**

If you have security concerns or questions, please:
- Check the OpenAI documentation
- Review your API usage on the OpenAI platform
- Follow OpenAI's security best practices 