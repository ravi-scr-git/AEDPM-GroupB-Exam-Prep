# -*- coding: utf-8 -*-
"""
Local HTTP Server for AEDPM Group-B Exam Preparation Portal
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 65)
        print("  🚂 INDIAN RAILWAYS AEDPM GROUP-B EXAM PREPARATION PORTAL")
        print("=" * 65)
        print(f"  Server active at: {url}")
        print("  Topics: 47 comprehensive syllabus modules")
        print("  Question Bank: 1,515 exam-standard MCQs with explanations")
        print("  Interactive Mind Maps, Design Flows & CBT Simulator ready!")
        print("=" * 65)
        print("  Press Ctrl+C to stop the local server.")
        
        # Open in default browser
        try:
            webbrowser.open(url)
        except Exception as e:
            print("  Could not auto-open browser:", e)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Server shutting down. Happy Studying!")

if __name__ == "__main__":
    run()
