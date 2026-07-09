---
name: 21st_dev
description: Interacts with the 21st.dev MCP API to search for and download React/Tailwind UI components and SVGL icons.
---

# 21st.dev MCP API

You can use the 21st.dev API to search for UI components and icons, and fetch their source code.
A custom client script is available at `.agents/skills/21st_dev/scripts/client.py`.

## Available Tools

The script accepts two arguments: the tool name and a JSON string or path to a JSON file containing the arguments.
If your JSON has complex quotes, write it to a temporary file in `test_params.json` and pass the filename.

### search_components
Search for components on 21st.dev.
**Arguments:**
- `query` (string): The search term.
- `type` (string, optional): One of "component", "block", "icon", "theme".

**Example:**
```powershell
python .agents/skills/21st_dev/scripts/client.py search_components test_params.json
```
(Where `test_params.json` contains `{"query": "navbar", "type": "component"}`)

### get_component
Get the source code for a specific component.
**Arguments:**
- `id` (number) OR `slug` (string): Identify the component.

**Example:**
```powershell
python .agents/skills/21st_dev/scripts/client.py get_component test_params.json
```
(Where `test_params.json` contains `{"id": 13545}`)

### search_svgs
Search for brand icons and logos from SVGL.
**Arguments:**
- `query` (string)

### get_svg
Get the SVG code for an icon.
**Arguments:**
- `id` (number) OR `slug` (string)

## Best Practices
1. Always search first (`search_components` or `search_svgs`) to find the ID or Slug of the component you want.
2. Use `get_component` or `get_svg` to fetch the source code and installation instructions.
3. Due to PowerShell quote escaping issues, it is recommended to write your JSON parameters to a file using the `write_to_file` tool, and then pass the file path to the python script.

