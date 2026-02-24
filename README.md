# GROWTH — App de Productivité IA

Application de productivité exigeante avec mentor IA intégré. Timer Pomodoro, intentions quotidiennes, bilan du soir, et coaching personnalisé via Claude.

## Stack

- React 18 + Vite
- Supabase (auth + base de données)
- API Anthropic Claude (claude-haiku-4-5-20251001)
- React Router DOM v6

## Déploiement — Guide complet

### 1. Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans **SQL Editor** et exécuter tout le contenu de `supabase_schema.sql`
4. Récupérer les clés dans **Project Settings → API** :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 2. Anthropic

1. Créer un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générer une clé API → `VITE_ANTHROPIC_KEY`

### 3. Variables d'environnement

```bash
cp .env.example .env
```

Remplir `.env` avec vos clés :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_ANTHROPIC_KEY=sk-ant-xxx...
```

### 4. Build & Déploiement

```bash
npm install
npm run build
```

Le dossier `dist/` contient l'app prête à déployer.

**Sur Apache** : créer un fichier `.htaccess` à la racine du serveur :

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QL]
```

**Sur Nginx** :

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Sur Vercel/Netlify** : déposer le dossier `dist/` directement, le routing est géré automatiquement.

## Développement local

```bash
npm install
npm run dev
```

L'app tourne sur `http://localhost:5173`

## Fonctionnalités

- **Auth** : inscription / connexion email
- **Onboarding** : 4 étapes pour définir vision, projets, jalons, blocages
- **Dashboard** : intention du jour, streak, heatmap 70 jours, vélocité
- **Rituel Soir** : définir l'intention du lendemain avec aide IA
- **Focus (Bloc)** : timer 25min avec cercle SVG animé
- **Projets** : vue de tous les projets avec progression
- **Mentor** : chat IA personnalisé avec contexte complet
- **Bilan** : analyse de fin de journée avec retour mentor
