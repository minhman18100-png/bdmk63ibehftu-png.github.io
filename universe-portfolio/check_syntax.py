import re

with open('script.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Tokenize string literals and regex
in_str = False
str_char = ''
escape = False
clean_chars = []

i = 0
n = len(text)
line = 1
col = 1

while i < n:
    c = text[i]
    if c == '\n':
        line += 1
        col = 1
    else:
        col += 1

    if in_str:
        if escape:
            escape = False
        elif c == '\\':
            escape = True
        elif c == str_char:
            in_str = False
        i += 1
        continue

    # Comments
    if c == '/' and i + 1 < n and text[i+1] == '/':
        while i < n and text[i] != '\n':
            i += 1
        continue
    if c == '/' and i + 1 < n and text[i+1] == '*':
        i += 2
        while i + 1 < n and not (text[i] == '*' and text[i+1] == '/'):
            if text[i] == '\n':
                line += 1
            i += 1
        i += 2
        continue

    # String start
    if c in ("'", '"', '`'):
        in_str = True
        str_char = c
        escape = False
        i += 1
        continue

    clean_chars.append((c, line, col))
    i += 1

stack = []
pairs = {'{': '}', '(': ')', '[': ']'}
for c, l, col in clean_chars:
    if c in '({[':
        stack.append((c, l, col))
    elif c in ')}]':
        if not stack:
            print(f"Unexpected {c} at line {l}, col {col}")
            exit(1)
        last, l_orig, col_orig = stack.pop()
        if pairs[last] != c:
            print(f"Mismatched {last} (line {l_orig}:{col_orig}) closed by {c} (line {l}:{col})")
            exit(1)

if stack:
    print(f"Unclosed items: {stack}")
else:
    print("ALL BRACKETS CLEAN AND BALANCED!")
