# Arquitectura MVVM en Android

El patrón MVVM (Model-View-ViewModel) es una de las arquitecturas más populares en el desarrollo de aplicaciones Android modernas. En este artículo, exploraremos cómo implementar MVVM correctamente.

## ¿Qué es MVVM?

MVVM es un patrón arquitectónico que separa la lógica de presentación de la lógica de negocio y la interfaz de usuario. Sus componentes principales son:

- **Model**: Representa los datos y la lógica de negocio
- **View**: La interfaz de usuario
- **ViewModel**: Maneja la lógica de presentación y el estado de la UI

## Implementación básica

### 1. Model
```kotlin
data class User(
    val id: String,
    val name: String,
    val email: String
)

interface UserRepository {
    suspend fun getUsers(): List<User>
    suspend fun saveUser(user: User)
}
```

### 2. ViewModel
```kotlin
class UserViewModel(
    private val repository: UserRepository
) : ViewModel() {
    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    fun loadUsers() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _users.value = repository.getUsers()
            } catch (e: Exception) {
                // Manejar error
            } finally {
                _isLoading.value = false
            }
        }
    }
}
```

### 3. View (Compose)
```kotlin
@Composable
fun UserScreen(
    viewModel: UserViewModel = hiltViewModel()
) {
    val users by viewModel.users.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadUsers()
    }

    if (isLoading) {
        CircularProgressIndicator()
    } else {
        LazyColumn {
            items(users) { user ->
                UserItem(user)
            }
        }
    }
}
```

## Mejores prácticas

1. **Manejo de estado**
   - Usar StateFlow para estado observable
   - Implementar estados de UI (loading, error, success)
   - Manejar la configuración de cambios

2. **Inyección de dependencias**
   - Usar Hilt para inyección
   - Proporcionar ViewModels a través de ViewModelProvider
   - Mantener las dependencias testables

3. **Testing**
   - Pruebas unitarias para ViewModels
   - Pruebas de integración para repositorios
   - Pruebas de UI con Compose

## Ejemplo de testing

```kotlin
@Test
fun `test user loading`() = runTest {
    // Arrange
    val repository = mock<UserRepository>()
    val users = listOf(User("1", "Test", "test@test.com"))
    whenever(repository.getUsers()).thenReturn(users)
    
    val viewModel = UserViewModel(repository)
    
    // Act
    viewModel.loadUsers()
    
    // Assert
    assertEquals(users, viewModel.users.value)
    assertFalse(viewModel.isLoading.value)
}
```

## Ventajas de MVVM

- **Separación de responsabilidades**
- **Testabilidad mejorada**
- **Mantenibilidad del código**
- **Reutilización de componentes**
- **Ciclo de vida más simple**

## Conclusión

MVVM es una arquitectura robusta y flexible que se adapta bien a las necesidades modernas del desarrollo Android. Con las herramientas adecuadas y siguiendo las mejores prácticas, puedes crear aplicaciones mantenibles y escalables. 