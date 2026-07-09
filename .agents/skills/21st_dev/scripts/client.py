import sys
import json
import urllib.request
import urllib.error
import os

sys.stdout.reconfigure(encoding='utf-8')

API_KEY = "21st_sk_8352563bc42c8c978add9b41aaec4642f2c36534b6b1766b99c089ffc946590c"
URL = "https://21st.dev/api/mcp"

def call_mcp(method, params):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params
    }
    
    req = urllib.request.Request(
        URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            if "error" in res_json:
                print(f"Error from API: {res_json['error']}", file=sys.stderr)
                sys.exit(1)
            # Print the tool result text
            result = res_json.get("result", {})
            for content in result.get("content", []):
                print(content.get("text", ""))
    except urllib.error.URLError as e:
        print(f"HTTP Error: {e}", file=sys.stderr)
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python client.py <tool_name> [json_file_path_or_string]")
        sys.exit(1)
        
    method = "tools/call"
    tool_name = sys.argv[1]
    
    tool_params = {}
    if len(sys.argv) > 2:
        arg2 = sys.argv[2]
        if os.path.isfile(arg2):
            with open(arg2, "r") as f:
                try:
                    tool_params = json.load(f)
                except json.JSONDecodeError:
                    print("Error: file does not contain valid JSON", file=sys.stderr)
                    sys.exit(1)
        else:
            try:
                tool_params = json.loads(arg2)
            except json.JSONDecodeError:
                print("Error: params must be valid JSON", file=sys.stderr)
                sys.exit(1)
            
    params = {
        "name": tool_name,
        "arguments": tool_params
    }
    
    call_mcp(method, params)

if __name__ == "__main__":
    main()
