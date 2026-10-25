<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Maintenance — {{ $app_name ?? 'Pharmacopee' }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            min-height: 100vh;
            background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: white;
            padding: 2rem;
        }

        .card {
            max-width: 520px;
            width: 100%;
            text-align: center;
        }

        .icon {
            width: 80px;
            height: 80px;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            font-size: 2.5rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        h1 {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 1rem;
            letter-spacing: -0.02em;
        }

        .app-name {
            color: #6ee7b7;
        }

        p {
            font-size: 1.05rem;
            line-height: 1.7;
            color: rgba(255,255,255,0.8);
            margin-bottom: 2rem;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 100px;
            padding: 0.5rem 1.25rem;
            font-size: 0.875rem;
            color: rgba(255,255,255,0.9);
            backdrop-filter: blur(10px);
        }

        .dot {
            width: 8px;
            height: 8px;
            background: #fbbf24;
            border-radius: 50%;
            animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%       { opacity: 0.5; transform: scale(0.8); }
        }

        .divider {
            width: 60px;
            height: 3px;
            background: #6ee7b7;
            border-radius: 2px;
            margin: 2rem auto;
            opacity: 0.6;
        }

        .contact {
            font-size: 0.875rem;
            color: rgba(255,255,255,0.6);
        }

        .contact a {
            color: #6ee7b7;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">🌿</div>

        <h1>
            <span class="app-name">{{ $app_name ?? 'Pharmacopee' }}</span><br />
            est en maintenance
        </h1>

        <p>
            Nous effectuons des améliorations pour vous offrir une meilleure expérience.
            La plateforme sera de nouveau disponible très prochainement.
        </p>

        <div class="badge">
            <div class="dot"></div>
            Maintenance en cours
        </div>

        <div class="divider"></div>

        <p class="contact">
            Des questions ?
            <a href="mailto:contact@pharmacopee.com">contact@pharmacopee.com</a>
        </p>
    </div>
</body>
</html>