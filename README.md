# Nexabank
> 🌐 L’applicazione è completamente funzionante e accessibile online tramite dominio pubblico [https://nexabank.it](https://nexabank.it)

Nexabank è un’applicazione web progettata per la gestione digitale di conti bancari, carte e transazioni, sviluppata come elaborato universitario nell’ambito del corso di laurea **Informatica per le Aziende Digitali (L-31)**.

---

## Screenshot dell’applicazione

<img width="1437" height="809" alt="Screenshot 2026-02-09 alle 15 49 18" src="https://github.com/user-attachments/assets/74ffe721-7407-4a59-bfaa-a7cbf33a86c4" />

Il progetto simula le principali funzionalità di una banca digitale, con particolare attenzione a sicurezza, architettura e user experience.

---

## Funzionalità principali

- Autenticazione e autorizzazione tramite JWT
- Gestione dei conti bancari personali
- Gestione delle carte associate ai conti
- Creazione e visualizzazione delle transazioni
- Flussi di sicurezza basati su OTP per operazioni sensibili
- Ruoli utente (user / admin)

---

## Architettura

L’applicazione adotta un’architettura **client-server** basata su API REST:

- **Backend**: espone API REST stateless con autenticazione JWT
- **Frontend**: applicazione web che consuma le API tramite TanStack Query
- **Database**: gestione dei dati tramite modello non relazionale

---

## Tecnologie utilizzate

### Backend
- Node.js
- Express
- JWT
- OTP-based security
- MongoDB

### Frontend
- React
- TypeScript
- TanStack Query
- Redux / Context
- Axios

---

## Sicurezza

- Autenticazione stateless tramite JWT
- Autorizzazione basata sui ruoli
- OTP per operazioni critiche
- Validazione degli input tramite schema
- Protezione delle risorse tramite middleware

---

## Avvio del progetto

```bash
# Backend
npm install
npm run build
npm start

# Frontend
npm install
npm run dev
```
**Nota**  
Il progetto è corredato da documentazione specifica all’interno delle cartelle front-end e back-end.  
La consultazione dei rispettivi file **README** è necessaria per comprendere la struttura dell’applicazione, configurare correttamente le variabili d’ambiente e avviare i server in modo appropriato.

Per eseguire correttamente il progetto sul proprio PC, assicurati di avere installato e configurato correttamente le seguenti dipendenze:
- Node.js – necessario per eseguire sia il backend sia il frontend.
- MongoDB – il server deve essere avviato in replicaset, altrimenti le sessioni e la persistenza delle operazioni potrebbero non funzionare correttamente.
- TypeScript – necessario per compilare eventuali file TypeScript presenti nel progetto.
  
💡 Verifica che tutte le dipendenze siano funzionanti prima di avviare il backend. Questo garantirà il corretto collegamento al database, la gestione delle sessioni e il normale funzionamento delle API.
