// src/extension.ts
import * as vscode from 'vscode';
import * as path from 'path';

let webviewPanel: vscode.WebviewPanel | undefined;

export function subwaySurfers(context: vscode.ExtensionContext) {
    let commandPaletteDisposable = vscode.commands.registerCommand('below-c-level.subwaySurfers', () => {
        showSubwaySurfersVideo(context);
    });

    context.subscriptions.push(commandPaletteDisposable);
}

function showSubwaySurfersVideo(context: vscode.ExtensionContext) {
    if (webviewPanel) {
        webviewPanel.reveal();
        return;
    }

            webviewPanel = vscode.window.createWebviewPanel(
        'subwaySurfers',
        'Subway Surfers',
        vscode.ViewColumn.Beside, // Right side panel
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'media')),
                vscode.Uri.file(context.extensionPath)
            ]
        }
    );

    webviewPanel.webview.html = getWebviewContent(webviewPanel.webview, context);

    webviewPanel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'minimize':
                    // Just hide, don't close
                    webviewPanel?.dispose();
                    return;
            }
        },
        undefined,
        context.subscriptions
    );

    webviewPanel.onDidDispose(() => {
        webviewPanel = undefined;
    }, null, context.subscriptions);
}

function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext) {
    // Path to your video file (place video in media folder)
    const videoPath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'subway-surfers.mp4'));
    const videoUri = webview.asWebviewUri(videoPath);
    
    console.log('Video path:', videoPath.fsPath);
    console.log('Video URI:', videoUri.toString());

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subway Surfers</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #000;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
            font-family: 'Courier New', monospace;
        }
        
        .fullscreen-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 1;
        }
        
        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            pointer-events: none;
        }
        
        .minimize-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.7);
            border: none;
            color: white;
            padding: 5px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            z-index: 10;
            pointer-events: auto;
        }
        
        .minimize-btn:hover {
            background: rgba(0,0,0,0.9);
        }
        
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 14px;
            text-align: center;
            z-index: 5;
        }
        
        .spinner {
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 10px auto;
        }
    </style>
</head>
<body>
    <div class="loading" id="loading">
        <div class="spinner"></div>
        <div>Loading...</div>
    </div>
    
    <video 
        class="fullscreen-video" 
        id="mainVideo"
        autoplay 
        loop 
        muted
        style="display: none;"
        onloadeddata="videoLoaded()"
        onerror="videoError()"
        oncanplay="videoCanPlay()">
        <source src="${videoUri}" type="video/mp4">
        <source src="${videoUri}" type="video/webm">
        <source src="${videoUri}" type="video/ogg">
        Your browser does not support the video tag.
    </video>
    
    <div class="overlay">
        <button class="minimize-btn" onclick="minimizeVideo()">×</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let isVideoPlaying = false;
        
        function videoLoaded() {
            console.log('Video loaded successfully');
            document.getElementById('loading').style.display = 'none';
            document.getElementById('mainVideo').style.display = 'block';
            isVideoPlaying = true;
            
            // Ensure video plays
            const video = document.getElementById('mainVideo');
            video.play().catch(e => console.log('Autoplay prevented:', e));
        }
        
        function videoCanPlay() {
            console.log('Video can play');
            // Backup in case onloadeddata doesn't fire
            setTimeout(() => {
                if (document.getElementById('loading').style.display !== 'none') {
                    videoLoaded();
                }
            }, 1000);
        }
        
        function videoError() {
            console.log('Video failed to load');
            document.getElementById('loading').innerHTML = 
                '<div style="color: #ff0000;">Video file not found!<br><br>' +
                'Expected path: media/subway-surfers.mp4<br><br>' +
                'Make sure the file exists and try again.<br><br>' +
                'Video URI: ${videoUri}<br><br>' +
                '<button onclick="retryLoad()" style="padding: 10px; margin-top: 10px;">Retry</button></div>';
        }
        
        function retryLoad() {
            location.reload();
        }
        
        function minimizeVideo() {
            vscode.postMessage({ command: 'minimize' });
        }
        
        // ESC key to minimize
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                minimizeVideo();
            }
        });
        
        // Prevent right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Keep video playing even when not focused
        document.addEventListener('visibilitychange', () => {
            if (isVideoPlaying) {
                const video = document.getElementById('mainVideo');
                if (video.paused) {
                    video.play().catch(e => console.log('Resume failed:', e));
                }
            }
        });
        
        // Click anywhere to toggle play/pause
        document.addEventListener('click', (e) => {
            if (e.target.className !== 'minimize-btn') {
                const video = document.getElementById('mainVideo');
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {
    if (webviewPanel) {
        webviewPanel.dispose();
    }
}