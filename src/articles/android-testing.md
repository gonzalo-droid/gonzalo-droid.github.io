# Testing en Android: Guía completa

El testing es una parte fundamental del desarrollo de aplicaciones Android. En este artículo, exploraremos las diferentes estrategias y herramientas disponibles para testing en Android.

## Tipos de Testing

### 1. Unit Testing
```kotlin
class UserRepositoryTest {
    @Test
    fun `test user creation`() {
        // Arrange
        val user = User("1", "Test User")
        
        // Act
        val result = userRepository.createUser(user)
        
        // Assert
        assertTrue(result.isSuccess)
        assertEquals(user, result.getOrNull())
    }
}
```

### 2. Integration Testing
```kotlin
@HiltAndroidTest
class UserFlowTest {
    @get:Rule
    val hiltRule = HiltAndroidRule(this)
    
    @Inject
    lateinit var userRepository: UserRepository
    
    @Test
    fun testUserFlow() {
        // Arrange
        val user = User("1", "Test User")
        
        // Act
        userRepository.createUser(user)
        val savedUser = userRepository.getUser("1")
        
        // Assert
        assertEquals(user, savedUser)
    }
}
```

## Testing de UI

### 1. Compose Testing
```kotlin
@Test
fun testUserScreen() {
    composeTestRule.setContent {
        UserScreen(viewModel = viewModel)
    }
    
    composeTestRule
        .onNodeWithText("Test User")
        .assertIsDisplayed()
    
    composeTestRule
        .onNodeWithContentDescription("Edit")
        .performClick()
    
    composeTestRule
        .onNodeWithText("Edit User")
        .assertIsDisplayed()
}
```

### 2. Espresso Testing
```kotlin
@Test
fun testUserList() {
    // Arrange
    val users = listOf(User("1", "Test User"))
    userRepository.setUsers(users)
    
    // Act
    activityRule.launchActivity(null)
    
    // Assert
    onView(withId(R.id.user_list))
        .check(matches(isDisplayed()))
    
    onView(withText("Test User"))
        .check(matches(isDisplayed()))
}
```

## Testing de ViewModels

### 1. ViewModel Testing
```kotlin
class UserViewModelTest {
    @Test
    fun `test user loading`() = runTest {
        // Arrange
        val users = listOf(User("1", "Test User"))
        val repository = mock<UserRepository>()
        whenever(repository.getUsers()).thenReturn(users)
        
        val viewModel = UserViewModel(repository)
        
        // Act
        viewModel.loadUsers()
        
        // Assert
        assertEquals(users, viewModel.users.value)
    }
}
```

### 2. State Testing
```kotlin
@Test
fun `test loading state`() = runTest {
    // Arrange
    val viewModel = UserViewModel(repository)
    
    // Act
    viewModel.loadUsers()
    
    // Assert
    assertTrue(viewModel.isLoading.value)
    
    // Simular carga completada
    advanceUntilIdle()
    
    assertFalse(viewModel.isLoading.value)
}
```

## Testing de Coroutines

### 1. Coroutine Testing
```kotlin
@Test
fun `test coroutine flow`() = runTest {
    // Arrange
    val flow = flow {
        emit(1)
        delay(100)
        emit(2)
    }
    
    // Act & Assert
    flow.test {
        assertEquals(1, awaitItem())
        assertEquals(2, awaitItem())
        awaitComplete()
    }
}
```

### 2. Error Handling
```kotlin
@Test
fun `test error handling`() = runTest {
    // Arrange
    val error = RuntimeException("Test error")
    val flow = flow { throw error }
    
    // Act & Assert
    flow.test {
        assertTrue(awaitError() is RuntimeException)
    }
}
```

## Mejores prácticas

1. **Estructura de pruebas**
   - Seguir el patrón AAA (Arrange-Act-Assert)
   - Mantener las pruebas independientes
   - Usar nombres descriptivos

2. **Mocks y Fakes**
   - Usar mocks para dependencias externas
   - Implementar fakes para testing de integración
   - Evitar mocks excesivos

3. **Cobertura de código**
   - Apuntar a una cobertura significativa
   - Enfocarse en casos de uso críticos
   - No obsesionarse con el 100%

## Herramientas de testing

1. **JUnit**
   - Framework base para testing
   - Anotaciones para configuración
   - Assertions para validaciones

2. **Mockito**
   - Creación de mocks
   - Verificación de interacciones
   - Stubbing de comportamientos

3. **Espresso**
   - Testing de UI
   - Interacciones con vistas
   - Validaciones de estado

4. **Compose Testing**
   - Testing de UI declarativa
   - Interacciones con composables
   - Validaciones de estado

## Ventajas de un buen testing

- **Detección temprana de errores**
- **Refactorización segura**
- **Documentación viva**
- **Mejor diseño de código**
- **Confianza en el código**

## Conclusión

El testing es una parte esencial del desarrollo de aplicaciones Android. Una buena estrategia de testing ayuda a mantener la calidad del código y facilita el mantenimiento a largo plazo. 