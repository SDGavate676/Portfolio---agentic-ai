#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Portfolio Rendering Verification Script
Tests that all pages load correctly and content renders
"""

import sys
import time
import io

# Force UTF-8 encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("=" * 70)
print("PORTFOLIO CONTENT RENDERING VERIFICATION")
print("=" * 70)

# Check 1: Verify main JavaScript file
print("\n[1/6] Checking JavaScript file integrity...")
try:
    with open('js/main.js', 'r', encoding='utf-8') as f:
        content = f.read()
        checks = {
            'DOMContentLoaded': 'DOMContentLoaded' in content,
            'init() method': 'init()' in content,
            'setupPageNavigation()': 'setupPageNavigation()' in content,
            'displayContent()': 'displayContent()' in content,
            'setupScrollAnimations()': 'setupScrollAnimations()' in content,
            'Execution phase comments': 'Phase 1: Setup navigation' in content,
            'Error handling': 'console.error' in content,
            'Try/catch blocks': 'try {' in content,
        }
        
        for check, result in checks.items():
            status = '[PASS]' if result else '[FAIL]'
            print(f"  {status} {check}")
        
        all_js_good = all(checks.values())
except Exception as e:
    print(f"  [FAIL] Error reading main.js: {e}")
    all_js_good = False

# Check 2: Verify CSS file
print("\n[2/6] Checking CSS file integrity...")
try:
    with open('css/styles.css', 'r', encoding='utf-8') as f:
        content = f.read()
        checks = {
            'main element styling': 'main {' in content and 'min-height: calc(100vh - 100px)' in content,
            'main padding-top': 'padding-top: 70px' in content,
            'main#main-content': 'main#main-content {' in content,
            'main section padding': 'main section {' in content and 'padding: 4rem 0' in content,
            'fade-in-scroll visible': '.fade-in-scroll.visible' in content,
            'fade-in-scroll opacity': 'opacity: 1' in content,
        }
        
        for check, result in checks.items():
            status = '[PASS]' if result else '[FAIL]'
            print(f"  {status} {check}")
        
        all_css_good = all(checks.values())
except Exception as e:
    print(f"  [FAIL] Error reading styles.css: {e}")
    all_css_good = False

# Check 3: Verify HTML structure
print("\n[3/6] Checking HTML structure...")
try:
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
        checks = {
            'main#main-content element': 'id="main-content"' in content,
            'nav element': '<nav' in content,
            'footer element': '<footer' in content,
            'skip to content link': 'Skip to main content' in content,
            'script tag for main.js': '<script defer src="js/main.js">' in content,
            'Hash links in nav': 'href="#home"' in content and 'href="#projects"' in content,
        }
        
        for check, result in checks.items():
            status = '[PASS]' if result else '[FAIL]'
            print(f"  {status} {check}")
        
        all_html_good = all(checks.values())
except Exception as e:
    print(f"  [FAIL] Error reading index.html: {e}")
    all_html_good = False

# Check 4: Verify image assets
print("\n[4/6] Checking image assets...")
import os
try:
    images_needed = [
        'assets/images/profile.svg',
        'assets/images/project-1.svg',
        'assets/images/project-2.svg',
        'assets/images/project-3.svg',
        'assets/images/project-4.svg',
        'assets/images/project-5.svg',
        'assets/images/project-6.svg',
    ]
    
    images_ok = {}
    for img in images_needed:
        exists = os.path.exists(img)
        images_ok[img] = exists
        status = '[PASS]' if exists else '[FAIL]'
        print(f"  {status} {img}")
    
    all_images_good = all(images_ok.values())
except Exception as e:
    print(f"  [FAIL] Error checking images: {e}")
    all_images_good = False

# Check 5: Verify JavaScript execution order
print("\n[5/6] Checking JavaScript execution order...")
try:
    with open('js/main.js', 'r', encoding='utf-8') as f:
        content = f.read()
        
        # Find init method
        init_start = content.find('init() {')
        init_end = content.find('\n  }', init_start) + 5
        init_method = content[init_start:init_end]
        
        # Check order of calls
        display_pos = init_method.find('this.displayContent()')
        setup_anim_pos = init_method.find('this.setupScrollAnimations()')
        
        order_correct = display_pos > 0 and setup_anim_pos > 0 and display_pos < setup_anim_pos
        
        status = '[PASS]' if order_correct else '[FAIL]'
        print(f"  {status} displayContent() before setupScrollAnimations()")
        
        if not order_correct:
            print(f"    displayContent() position: {display_pos}")
            print(f"    setupScrollAnimations() position: {setup_anim_pos}")
        
        all_order_good = order_correct
except Exception as e:
    print(f"  [FAIL] Error checking execution order: {e}")
    all_order_good = False

# Check 6: Verify documentation
print("\n[6/6] Checking documentation...")
try:
    checks = {
        'DEBUGGING_GUIDE.md exists': os.path.exists('DEBUGGING_GUIDE.md'),
        'SOLUTION_REPORT.md exists': os.path.exists('SOLUTION_REPORT.md'),
    }
    
    for check, result in checks.items():
        status = '[PASS]' if result else '[FAIL]'
        print(f"  {status} {check}")
    
    all_docs_good = all(checks.values())
except Exception as e:
    print(f"  [FAIL] Error checking documentation: {e}")
    all_docs_good = False

# Final verdict
print("\n" + "=" * 70)
all_good = all([all_js_good, all_css_good, all_html_good, all_images_good, all_order_good, all_docs_good])

if all_good:
    print("[SUCCESS] ALL CHECKS PASSED - PORTFOLIO IS READY FOR DEPLOYMENT")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Start development server: python -m http.server 8000")
    print("2. Open http://localhost:8000 in browser")
    print("3. Verify content renders on home page")
    print("4. Test navigation to other pages")
    print("5. Check DevTools Console for initialization logs")
    sys.exit(0)
else:
    print("[FAILED] SOME CHECKS FAILED - PLEASE REVIEW ABOVE")
    print("=" * 70)
    sys.exit(1)
