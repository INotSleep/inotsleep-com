# TODO list

## 1. i18n module

### Tables

---
- Name: i18n_supported_projects
- Porpuse: To fast sort by projects & faster fetch
- Columns: id PK, slug U, name
---
- Name: i18n_keys
- Porpuse: to store list of keys
- Columns: id PK, key_name, description, project FK(i18n_supported_projects(id)); u(project, key_name)
---
- Name: i18n_languages
- Porpuse: To store languages
- Columns: code PK
---
- Name: i18n_translations
- Porpuse: To store translations
- Columns: key_id FK(i18n_keys(id)) language FK(i18n_languages(code)), value; PK(key_id)
---
- Name: i18n_suggestions
- Porpuse: To store user suggestions to translation
- Columns: id PK, language FK(i18n_languages(code)), value, author FK(users(id)), status, created_at, reviewed_at
---
- Name: i18n_audit
- Porpuse: To log changes
- Columns: id PK, FK(i18n_supported_projects(id)), FK( i18n_keys(id)), language FK(i18n_languages(code)), action,old_value, new_value, author_id FK(users(id)), created_at

