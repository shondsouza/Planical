import sys
import re

def fix_indentation_issues(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Fix line 984 (join_room indentation)
        if '    join_room(' in lines[984-1]:
            lines[984-1] = '        join_room(\'doctor-room\')\n'
            print("Fixed indentation at line 984")
        
        # Fix line 1037 (leave_room indentation)
        if '        leave_room(' in lines[1037-1]:
            lines[1037-1] = '    leave_room(\'doctor-room\')\n'
            print("Fixed indentation at line 1037")
        
        # Fix line 320 (return redirect indentation)
        try:
            if '            return redirect' in lines[320-1]:
                lines[320-1] = '                return redirect(url_for(\'home\'))\n'
                print("Fixed indentation at line 320")
        except IndexError:
            print("Line 320 not found, skipping")
        
        # Write the fixed file
        with open(filename, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        
        print(f"Fixed indentation issues in {filename}")
        return True
    except Exception as e:
        print(f"Error fixing indentation: {str(e)}")
        return False

def fix_indentation():
    # Read the file
    with open('app.py', 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    # Fix the indentation issues
    for i in range(len(lines)):
        # Fix line where 'return redirect(url_for('home'))' has incorrect indentation
        if "return redirect(url_for('home'))" in lines[i] and lines[i-1].strip().endswith('else:'):
            indent = lines[i-1].split('else:')[0] + '    '
            lines[i] = indent + "return redirect(url_for('home'))\n"
        
        # Fix line where join_room('doctor-room') has incorrect indentation
        if "join_room('doctor-room')" in lines[i] and lines[i-1].strip().endswith('if is_available:'):
            indent = lines[i-1].split('if is_available:')[0] + '    '
            lines[i] = indent + "join_room('doctor-room')\n"
    
    # Write the modified content back to the file
    with open('app.py', 'w', encoding='utf-8') as file:
        file.writelines(lines)
    
    print("Indentation fixes applied to app.py")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        filename = sys.argv[1]
    else:
        filename = "app.py"
    
    # Read the file
    with open(filename, 'r') as file:
        content = file.read()

    # Fix line 320 - add proper indentation to the return statement in the else clause
    pattern1 = r'(\s+else:\n)(\s+)return redirect\(url_for\(\'home\'\)\)'
    replacement1 = r'\1\2    return redirect(url_for(\'home\'))'

    content = re.sub(pattern1, replacement1, content)

    # Fix line 984 - add proper indentation to join_room('doctor-room')
    pattern2 = r'(\s+if is_available:\n)(\s+)join_room\(\'doctor-room\'\)'
    replacement2 = r'\1\2    join_room(\'doctor-room\')'

    content = re.sub(pattern2, replacement2, content)

    # Write the modified content back to the file
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Indentation fixes applied to app.py")

    fix_indentation() 