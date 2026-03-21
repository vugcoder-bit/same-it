import os
import re

def scan_translations():
    # Detect the base directory (one level up from scripts/)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    mobile_dir = os.path.dirname(current_dir)
    
    search_dirs = [
        os.path.join(mobile_dir, "app"),
        os.path.join(mobile_dir, "components")
    ]
    output_file = os.path.join(mobile_dir, "translation_scan_result.txt")

    # Regex patterns to find potentially untranslated strings
    patterns = [
        (re.compile(r'>\s*([A-Za-z][^<{]{1,})\s*<'), "JSX Text"),
        (re.compile(r'placeholder="([^"{}]{2,})"'), "Placeholder Prop"),
        (re.compile(r'title="([^"{}]{2,})"'), "Title Prop"),
        (re.compile(r'label="([^"{}]{2,})"'), "Label Prop"),
        (re.compile(r'Toast\.(?:success|error|warn|info)\("([^"]+)"\)'), "Toast Call"),
        (re.compile(r"Toast\.(?:success|error|warn|info)\('([^']+)'\)"), "Toast Call"),
        (re.compile(r'Alert\.alert\("([^"]+)"\)'), "Alert Call"),
        (re.compile(r"Alert\.alert\('([^']+)'\)"), "Alert Call"),
    ]

    # Strings to ignore (brand names, specific logic, etc.)
    ignore_list = ["SAME IT", "CableLaty", "admin", "admin123", "07XXXXXXXXX", "@username"]

    results = []

    for search_dir in search_dirs:
        if not os.path.exists(search_dir):
            continue
            
        for root, dirs, files in os.walk(search_dir):
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, mobile_dir)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            lines = f.readlines()
                            for i, line in enumerate(lines):
                                clean_line = line.strip()
                                
                                # Skip imports, interfaces, comments
                                if clean_line.startswith(('import ', 'export interface', '//', '/*')):
                                    continue
                                
                                # Skip if the line contains a translation function call wrapping the text
                                # This is a simple check; more complex logic would be needed for perfect accuracy
                                line_has_translation = "t('" in line or 't("' in line
                                
                                for pattern, label in patterns:
                                    matches = pattern.findall(line)
                                    for match in matches:
                                        if isinstance(match, tuple):
                                            match = match[0]
                                        
                                        match_text = match.strip()
                                        
                                        # Basic filters
                                        if not match_text or len(match_text) < 2:
                                            continue
                                        if match_text in ignore_list:
                                            continue
                                        if match_text.isdigit():
                                            continue
                                            
                                        # If the line has a translation call, check if the match is part of it
                                        # (Crude heuristic: if t('key') exists, assume the raw string might be a fallback or already handled)
                                        # We only flag if it looks truly hardcoded.
                                        if line_has_translation and f"'{match_text}'" in line:
                                             continue
                                        if line_has_translation and f'"{match_text}"' in line:
                                             continue

                                        results.append(f"[{label}] {relative_path}:{i+1} -> \"{match_text}\"")
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")

    # Remove duplicates
    results = list(set(results))
    results.sort()

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("=== UNTRANSLATED STRINGS SCAN REPORT ===\n")
        f.write(f"Generated at: {os.getcwd()}\n")
        f.write(f"Total potential issues: {len(results)}\n\n")
        if results:
            f.write("\n".join(results))
        else:
            f.write("Fantastic! No untranslated strings detected.")

    print(f"Scan complete. {len(results)} potential issues found.")
    print(f"Report saved to: {output_file}")

if __name__ == "__main__":
    scan_translations()
