# MY OS 0.3.0

## Planning intégré
Cours :
- Lundi : Géologie, Physique, Maths, Maths
- Mardi : Chimie, Physique, Chimie, Physique
- Mercredi : Chimie, Philosophie, Français, Français
- Jeudi : Anglais, Maths, Maths, Anglais
- Vendredi : Biologie, Biologie

Restitutions et préparation la veille :
- Lundi Chimie ← réviser dimanche
- Mardi Philosophie ← réviser lundi
- Mercredi Anglais ← réviser mardi
- Jeudi Biologie ← réviser mercredi
- Vendredi Géologie ← réviser jeudi
- Samedi Physique ← réviser vendredi

## Données
Les données sont stockées localement. La version 0.3 sait migrer les anciennes clés si elle s'exécute dans le même stockage navigateur. En passant du site PWA à l'APK Android, le stockage est séparé : AVANT de quitter l'ancienne version, ouvre Réglages > Exporter ma sauvegarde. Après installation de l'APK, utilise Importer une sauvegarde. Ne désinstalle pas l'ancienne PWA et ne vide pas ses données avant d'avoir vérifié l'import. Ce projet ne synchronise pas les données entre appareils.

## Android
Pré-requis : Node.js 20+, Java 21, Android SDK.
1. npm install
2. npm run build
3. npx cap add android (une seule fois)
4. npx cap sync android
5. Ajouter dans android/app/src/main/AndroidManifest.xml, à l'intérieur de <manifest> et avant <application> :
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
6. Ouvrir android/ dans Android Studio et construire un APK.

## Important : rappels
Les rappels sont des notifications locales Android. Android 13+ exige l'autorisation de notification. Android 12+ peut exiger l'autorisation des alarmes exactes pour une heure précise. Les réglages batterie du téléphone peuvent affecter la ponctualité. L'application reprogramme un lot de rappels à son ouverture et après modification des heures.

## Mise à jour Android
L'écran Réglages > À propos interroge la dernière GitHub Release et ouvre sa page. L'installation de l'APK reste confirmée par Android.
Pour permettre une mise à jour par-dessus l'installation précédente, il faut signer toutes les versions avec le même keystore et conserver appId `com.myos.app`. Ne jamais publier ni partager le keystore ou ses mots de passe.

## APK de test via GitHub Actions
Le workflow `.github/workflows/android-test.yml` construit un APK de test non destiné à servir de version de mise à jour permanente. Les builds debug GitHub peuvent avoir une signature différente d'un build à l'autre. Ne l'utilise pas comme installation quotidienne tant que le keystore de signature durable n'a pas été configuré. La version finale doit être signée avec un keystore privé stable pour permettre les mises à jour par-dessus l'application existante.
