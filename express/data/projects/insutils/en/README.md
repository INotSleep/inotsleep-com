INSUtils is a small utility library that makes Paper plugin development easier, cleaner and more consistent.

It provides a basic plugin main class with all the template code hidden under the hood, an annotation-based configuration and pathing system with access to raw `SnakeYAML` nodes, and a handy i18n module that centralizes all your localization files in one place.

## Why use INSUtils?

When you write more than one plugin, you quickly start to repeat yourself:

- the same `onEnable` / `onDisable` boilerplate,
- the same config loading and validation logic,
- the same copy-pasted i18n and YAML helpers.

INSUtils extracts all of that into a reusable library so you can focus on the actual features of your plugin instead of infrastructure code.

## Core features

- **Base plugin main class**  
  Extend a single abstract base class and get:
  - clean lifecycle handling,
  - structured logging,
  - built-in config + i18n bootstrapping.

- **Annotation-based configuration pathing**  
  Use simple `@Annotation`-style mapping to bind config values to fields or methods, while still having access to raw `SnakeYAML` nodes when you need full control.

- **Centralized i18n module**  
  Keep all translations for all your plugins in one place.  
  INSUtils provides:
  - a shared localization folder,
  - a simple API for fetching messages,
  - support for list messages and rich formatting.

- **YAML utilities**  
  Work directly with `SnakeYAML` nodes when you need advanced behavior, without rewriting the same parsing helpers again and again.

![Configuration flow](/api/projects/insutils/assets/config-flow.png?lang={{LANG}})

## Typical use cases

- You maintain multiple Paper plugins and want them to share the same:
  - config loading patterns,
  - i18n style and message structure,
  - logging behavior.

- You want to experiment with new plugins quickly, without setting up the same project skeleton every time.

- You are building a larger plugin and want a clean separation between:
  - business logic,
  - configuration,
  - localization.

## Getting started

INSUtils is distributed as a standalone plugin and is meant to be used as a **provided / compileOnly** dependency in your project.  
Do **not** shade or relocate it into your own plugin jar – just drop the INSUtils plugin jar onto the server alongside your plugin.

### Gradle (Kotlin DSL)

```kotlin
repositories {
    maven {
        url = uri("https://nexus.inotsleep.com/repository/maven-public/")
    }
}

dependencies {
    compileOnly("com.inotsleep:utils:VERSION")
}
````

### Gradle (Groovy DSL)

```groovy
repositories {
    maven {
        url "https://nexus.inotsleep.com/repository/maven-public/"
    }
}

dependencies {
    compileOnly "com.inotsleep:utils:VERSION"
}
```

### Maven

```xml
<repositories>
  <repository>
    <id>inotsleep-nexus</id>
    <url>https://nexus.inotsleep.com/repository/maven-public/</url>
  </repository>
</repositories>

<dependencies>
  <dependency>
    <groupId>com.inotsleep</groupId>
    <artifactId>utils</artifactId>
    <version>VERSION</version>
    <scope>provided</scope>
  </dependency>
</dependencies>
```

Then extend the provided base plugin class and start using the config and i18n helpers in your own code.

---

For more detailed documentation, examples and advanced usage, see the **Wiki** linked on this page.

