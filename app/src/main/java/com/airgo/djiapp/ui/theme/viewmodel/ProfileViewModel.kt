package com.airgo.djiapp.ui.theme.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.airgo.djiapp.ui.theme.network.ProfileApi
import com.airgo.djiapp.ui.theme.network.UserProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {

    private val api = ProfileApi.create()

    private val _profileData = MutableStateFlow<UserProfile?>(null)
    val profileData: StateFlow<UserProfile?> = _profileData

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _errorMessage = MutableStateFlow("")
    val errorMessage: StateFlow<String> = _errorMessage

    // Call this once after user logs in
    fun loadProfile(userEmail: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = ""
            try {
                val response = api.getUserProfile(userEmail)
                _profileData.value = response
            } catch (e: Exception) {
                e.printStackTrace()
                _errorMessage.value = "Error: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
    fun setError(msg: String) {
        _errorMessage.value = msg
    }
}