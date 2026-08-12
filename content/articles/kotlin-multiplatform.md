# Desarrollo de Apps con Kotlin Multiplatform

Kotlin Multiplatform (KMP) es una tecnología que permite compartir código entre diferentes plataformas, principalmente Android e iOS. En este artículo, exploraremos cómo utilizar KMP para desarrollar aplicaciones multiplataforma eficientemente.

## ¿Qué es Kotlin Multiplatform?

Kotlin Multiplatform es una solución que permite escribir código común en Kotlin y compilarlo para diferentes plataformas. Esto significa que puedes compartir la lógica de negocio, el manejo de datos y otras funcionalidades entre Android e iOS.

## Ventajas de usar KMP

- **Código compartido**: Reduce la duplicación de código
- **Mantenibilidad**: Un solo código base para múltiples plataformas
- **Rendimiento**: Código nativo para cada plataforma
- **Flexibilidad**: Puedes compartir tanto o tan poco código como necesites

## Estructura básica de un proyecto KMP

```kotlin
// commonMain/kotlin/com/example/shared/Repository.kt
interface Repository {
    suspend fun getData(): List<Data>
}

// androidMain/kotlin/com/example/shared/AndroidRepository.kt
class AndroidRepository : Repository {
    override suspend fun getData(): List<Data> {
        // Implementación específica para Android
    }
}

// iosMain/kotlin/com/example/shared/IosRepository.kt
class IosRepository : Repository {
    override suspend fun getData(): List<Data> {
        // Implementación específica para iOS
    }
}
```

## Bibliotecas esenciales

1. **Ktor**: Cliente HTTP multiplataforma
2. **Kotlinx.serialization**: Serialización JSON
3. **SQLDelight**: Base de datos SQL multiplataforma
4. **Koin**: Inyección de dependencias

## Ejemplo de implementación

```kotlin
// Modelo compartido
data class User(
    val id: String,
    val name: String,
    val email: String
)

// Repositorio compartido
interface UserRepository {
    suspend fun getUsers(): List<User>
    suspend fun saveUser(user: User)
}

// ViewModel compartido
class UserViewModel(
    private val repository: UserRepository
) {
    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users.asStateFlow()

    suspend fun loadUsers() {
        _users.value = repository.getUsers()
    }
}
```

## Mejores prácticas

1. **Separación de responsabilidades**
   - Código común en módulos compartidos
   - UI específica en cada plataforma
   - Lógica de negocio compartida

2. **Manejo de dependencias**
   - Usar expect/actual para APIs específicas
   - Implementar interfaces en cada plataforma
   - Mantener la compatibilidad

3. **Testing**
   - Pruebas unitarias en código compartido
   - Pruebas específicas para cada plataforma
   - Mocks y stubs para testing

## Conclusión

Kotlin Multiplatform es una excelente opción para desarrollar aplicaciones multiplataforma, permitiendo compartir código mientras mantienes la flexibilidad de implementar características específicas para cada plataforma. 