# Steam Store API

שרת REST API לחנות משחקים בסגנון Steam - החנות מוכרת מפתחות הפעלה (keys) למשחקים, ולכל משחק יש כמות מפתחות מוגבלת (מלאי).

**מגיש:** אריאל חזוט | **ת"ז:** 324056670

## טכנולוגיות
Node.js, Express, MongoDB, Mongoose, Zod, Postman

## התקנה והרצה

```bash
npm install
```

יש ליצור קובץ `.env` בתיקייה הראשית (לפי `.env.example`):

```
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/steam_store
```

מילוי נתוני דוגמה (מוחק את הנתונים הקיימים):

```bash
npm run seed
```

הרצת השרת:

```bash
npm start      # או npm run dev עם nodemon
```

## מבנה הפרויקט

```
├── server.js              # קובץ ראשי
├── seed.js                # נתוני דוגמה
├── config/db.js           # חיבור ל-MongoDB
├── models/                # User, Category, Game, Order
├── controllers/           # הלוגיקה של כל פעולה
├── routes/                # הגדרת הנתיבים
├── validations/schemas.js # סכמות Zod
├── middleware/            # טיפול בשגיאות ו-404
├── utils/                 # פונקציות עזר
└── postman/               # קולקשן לבדיקות
```

## Collections

| Collection | שדות עיקריים | קשרים |
|---|---|---|
| users | username, email, fullName, country | - |
| categories | name, description | - |
| games | title, developer, price, stock, platforms[], releaseDate | category → Category |
| orders | items[{ game, quantity, unitPrice }], totalPrice, status | user → User, items.game → Game |

## Endpoints

### Users
| Method | URL | תיאור |
|---|---|---|
| POST | /api/users | יצירת משתמש |
| GET | /api/users | כל המשתמשים |
| GET | /api/users/:id | משתמש לפי id |
| GET | /api/users/:id/orders | כל ההזמנות של משתמש |

### Categories
| Method | URL | תיאור |
|---|---|---|
| POST | /api/categories | יצירת קטגוריה |
| GET | /api/categories | כל הקטגוריות |
| GET | /api/categories/stats | מספר המשחקים בכל קטגוריה |
| GET | /api/categories/:id/games | משחקים לפי קטגוריה |

### Games
| Method | URL | תיאור |
|---|---|---|
| POST | /api/games | יצירת משחק |
| GET | /api/games | כל המשחקים (אפשר לסנן `?category=<id>`) |
| GET | /api/games/:id | משחק לפי id |
| PUT | /api/games/:id | עדכון משחק |
| DELETE | /api/games/:id | מחיקת משחק |

### Orders
| Method | URL | תיאור |
|---|---|---|
| POST | /api/orders | יצירת הזמנה |
| GET | /api/orders | כל ההזמנות |
| GET | /api/orders/:id | הזמנה עם פרטי המשתמש והמשחקים |
| PATCH | /api/orders/:id/cancel | ביטול הזמנה והחזרת המלאי |

דוגמה לגוף בקשה ליצירת הזמנה:

```json
{
  "user": "<userId>",
  "items": [
    { "game": "<gameId>", "quantity": 2 },
    { "game": "<gameId>", "quantity": 1 }
  ]
}
```

המחיר הכולל מחושב בשרת לפי המחיר של כל משחק במסד הנתונים.

## קודי סטטוס

| קוד | מתי |
|---|---|
| 200 | הצלחה |
| 201 | נוצר בהצלחה |
| 400 | מידע לא תקין / id לא תקין / אין מספיק מלאי |
| 404 | לא נמצא |
| 409 | ערך שכבר קיים (username, email, שם קטגוריה, שם משחק) |
| 500 | שגיאת שרת |

## בדיקות ב-Postman

יש לייבא את הקובץ `postman/Steam-Store-API.postman_collection.json`.
הבקשות שומרות לבד את ה-id-ים במשתנים (`userId`, `gameId` וכו'), לכן מומלץ להריץ אותן לפי הסדר או דרך Run Collection.
לפני הרצה חוזרת של הקולקשן כדאי להריץ `npm run seed` כדי להתחיל ממסד נקי.
