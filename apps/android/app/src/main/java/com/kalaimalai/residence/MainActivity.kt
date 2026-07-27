package com.kalaimalai.residence

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.kalaimalai.residence.ui.ResidenceApp
import com.kalaimalai.residence.ui.theme.ResidenceTheme

/**
 * Single-activity host. All navigation is Compose Navigation inside [ResidenceApp];
 * there is no second Activity and no fragment.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            ResidenceTheme {
                ResidenceApp()
            }
        }
    }
}
