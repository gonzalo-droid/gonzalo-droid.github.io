# Inyección de Dependencias en Android con Hilt

La inyección de dependencias es una técnica fundamental en el desarrollo de aplicaciones Android modernas. En este artículo, exploraremos cómo implementar DI usando Hilt, la solución oficial de Google.

## ¿Qué es la Inyección de Dependencias?

La inyección de dependencias es un patrón de diseño que permite la creación de componentes débilmente acoplados, facilitando el testing y la mantenibilidad del código. Hilt es una biblioteca que simplifica la implementación de DI en Android.

## Configuración básica

### 1. Dependencias
```gradle
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-kapt'
    id 'dagger.hilt.android.plugin'
}

dependencies {
    implementation "com.google.dagger:hilt-android:2.44"
    kapt "com.google.dagger:hilt-android-compiler:2.44"
}
```

### 2. Application
```kotlin
@HiltAndroidApp
class MyApplication : Application()
```

## Componentes principales

### 1. Módulos
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideUserRepository(
        api: UserApi,
        db: UserDatabase
    ): UserRepository {
        return UserRepositoryImpl(api, db)
    }
    
    @Provides
    @Singleton
    fun provideUserApi(): UserApi {
        return Retrofit.Builder()
            .baseUrl("https://api.example.com/")
            .build()
            .create(UserApi::class.java)
    }
}
```

### 2. Inyección en Activities y Fragments
```kotlin
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    @Inject
    lateinit var userRepository: UserRepository
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // userRepository ya está inyectado
    }
}
```

## Patrones avanzados

### 1. Inyección en ViewModels
```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    // ...
}
```

### 2. Módulos personalizados
```kotlin
@Module
@InstallIn(ActivityComponent::class)
object UserModule {
    @Provides
    fun provideUserManager(
        @ApplicationContext context: Context
    ): UserManager {
        return UserManager(context)
    }
}
```

## Testing

### 1. Configuración de pruebas
```kotlin
@HiltAndroidTest
class UserRepositoryTest {
    @get:Rule
    val hiltRule = HiltAndroidRule(this)
    
    @Inject
    lateinit var userRepository: UserRepository
    
    @Before
    fun setup() {
        hiltRule.inject()
    }
}
```

### 2. Módulos de prueba
```kotlin
@Module
@TestInstallIn(
    components = [SingletonComponent::class],
    replaces = [AppModule::class]
)
object TestAppModule {
    @Provides
    @Singleton
    fun provideUserRepository(): UserRepository {
        return FakeUserRepository()
    }
}
```

## Mejores prácticas

1. **Estructura de módulos**
   - Separar módulos por funcionalidad
   - Usar scopes apropiados
   - Mantener los módulos pequeños y enfocados

2. **Inyección de dependencias**
   - Inyectar en el nivel más alto posible
   - Usar constructor injection cuando sea posible
   - Evitar inyección de dependencias en clases de UI

3. **Testing**
   - Crear módulos de prueba específicos
   - Usar fakes o mocks según sea necesario
   - Mantener las pruebas independientes

## Ejemplos de uso

### 1. Inyección en un Service
```kotlin
@AndroidEntryPoint
class MyService : Service() {
    @Inject
    lateinit var dataManager: DataManager
    
    override fun onBind(intent: Intent?): IBinder? = null
}
```

### 2. Inyección en un WorkManager
```kotlin
@HiltWorker
class MyWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val repository: Repository
) : CoroutineWorker(context, workerParams)
```

## Ventajas de Hilt

- **Integración con Android**
- **Configuración mínima**
- **Soporte para testing**
- **Integración con ViewModel**
- **Documentación oficial**

## Conclusión

Hilt proporciona una solución robusta y fácil de usar para la inyección de dependencias en Android. Su integración con el ecosistema Android y su soporte para testing lo convierten en la opción preferida para proyectos modernos. 