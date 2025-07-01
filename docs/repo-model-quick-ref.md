# 📖 Repository-Model Quick Reference

> **TL;DR: Dokumentasi singkat hubungan Repository-Model**

## 🔗 Hubungan Dasar

```
Model ←→ Repository ←→ Service ←→ Controller
  ↓        ↓         ↓        ↓
Schema   Database  Logic   HTTP
```

## 🎯 Peran Masing-masing

### **Model** (`recipeModel.js`)
- ✅ Struktur data & schema
- ✅ Validasi business rules  
- ✅ Transform data (toJSON, toDatabase)

### **Repository** (`recipeRepository.js`) 
- ✅ Database operations (CRUD)
- ✅ Menggunakan Model untuk format data
- ✅ Return Model instances

### **Service** (`recipeService.js`)
- ✅ Business logic
- ✅ Koordinasi Repository-Model
- ✅ Response formatting

## 🔄 Flow Singkat

### CREATE:
```
Client → Controller → Service → Repository → Database
                        ↓           ↓
                   Model.validate() Model.create()
```

### READ:
```  
Database → Repository → Service → Controller → Client
    ↓         ↓
new Model() model.toJSON()
```

## 💡 Key Benefits

✅ **Separation of Concerns** - Setiap layer punya tugas jelas
✅ **Data Consistency** - Validasi terpusat di Model
✅ **Easy Testing** - Setiap layer independen
✅ **Maintainable** - Mudah modify dan debug

## 📚 Detail Lengkap

👉 [**Repository-Model Relationship Documentation**](repository-model-relationship.md)

---

*Quick reference untuk development team* 🚀
