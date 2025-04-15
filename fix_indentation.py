import re

def fix_indentation_issues(filename):
    print(f"Checking indentation in {filename}...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    line_num = 0
    issues_found = 0
    
    for line in lines:
        line_num += 1
        stripped = line.lstrip()
        
        # Skip empty lines and comments
        if not stripped or stripped.startswith('#'):
            fixed_lines.append(line)
            continue
        
        # Calculate indentation level (number of spaces)
        indentation = len(line) - len(stripped)
        
        # Check if indentation is a multiple of 4
        if indentation % 4 != 0:
            print(f"Line {line_num}: Indentation is {indentation} spaces (not a multiple of 4)")
            # Fix by rounding to nearest multiple of 4
            new_indentation = round(indentation / 4) * 4
            fixed_line = ' ' * new_indentation + stripped
            fixed_lines.append(fixed_line)
            issues_found += 1
        else:
            fixed_lines.append(line)
    
    if issues_found > 0:
        print(f"Found {issues_found} indentation issues. Writing fixed file...")
        with open(filename + '.fixed', 'w', encoding='utf-8') as f:
            f.writelines(fixed_lines)
        print(f"Fixed file written to {filename}.fixed")
    else:
        print("No indentation issues found!")

if __name__ == "__main__":
    fix_indentation_issues("app.py") 