# kotlinx.serialization keeps the generated serializer as a static field on the class;
# R8 cannot see the reflective lookup, so the companion/serializer must survive.
-keepclassmembers class com.kalaimalai.residence.data.** {
    *** Companion;
}
-keepclasseswithmembers class com.kalaimalai.residence.data.** {
    kotlinx.serialization.KSerializer serializer(...);
}
