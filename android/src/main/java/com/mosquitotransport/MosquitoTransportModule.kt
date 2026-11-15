package com.mosquitotransport

import android.util.ArrayMap
import androidx.annotation.Nullable
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.mosquitotransport.utils.FileUploader
import com.mosquitotransport.utils.UploadCallback
import javax.annotation.Nonnull
import android.os.SystemClock
import java.io.UnsupportedEncodingException
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException

class MosquitoTransportModule(reactContext: ReactApplicationContext) :
  NativeMosquitoTransportSpec(reactContext) {

  private val context = reactContext

  @Nonnull
  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = NativeMosquitoTransportSpec.NAME
  }

  @Throws(NoSuchAlgorithmException::class, UnsupportedEncodingException::class)
  private fun buildHash(toHash: String, algo: String, length: Int): String {
    val md = MessageDigest.getInstance(algo)
    md.update(toHash.toByteArray(StandardCharsets.UTF_8))
    val digest = md.digest()
    return String.format("%0${length}x", java.math.BigInteger(1, digest))
  }

  override fun addListener(eventType: String) {
      // No implementation needed for TurboModule
      // This implements the abstract method required by NativeMosquitoTransportSpec
  }

  override fun removeListeners(count: Double) {
      // No implementation needed for TurboModule
      // This implements the abstract method required by NativeMosquitoTransportSpec
  }

  private fun emitNewEvent(eventName: String, @Nullable params: WritableMap?) {
    context.emitDeviceEvent(eventName, params)
  }

  override fun getSystemUptime(promise: Promise) {
    val uptime = SystemClock.elapsedRealtime().toDouble()
    promise.resolve(uptime)
  }

  override fun sha256(toHash: String, promise: Promise) {
    try {
      val hash = buildHash(toHash, "SHA-256", 64)
      promise.resolve(hash)
    } catch (e: Exception) {
      promise.reject("Exception", "out of memory")
    }
  }

  private val uploaderMap = ArrayMap<String, FileUploader>()

  override fun uploadFile(readable: ReadableMap) {
      val processId = readable.getString("processID")
      val uploader = FileUploader()

      uploader.uploadFile(readable, object : UploadCallback {
          override fun onProgress(sentBytes: Long, totalBytes: Long) {
              val progress: WritableMap = WritableNativeMap().apply {
                  putInt("sentBytes", sentBytes.toInt())
                  putInt("totalBytes", totalBytes.toInt())
                  putString("processID", processId)
              }
              emitNewEvent("mt-uploading-progress", progress)
          }

          override fun onComplete(responseCode: Int, responseBody: String) {
              val statusData: WritableMap = WritableNativeMap().apply {
                  putString("processID", processId)
                  putString("result", responseBody)
              }
              emitNewEvent("mt-uploading-status", statusData)
          }

          override fun onError(e: Exception) {
              val statusData: WritableMap = WritableNativeMap().apply {
                  putString("processID", processId)
                  putString("error", "internal_error")
                  putString("errorDes", e.localizedMessage)
              }
              emitNewEvent("mt-uploading-status", statusData)
          }
      })

      uploaderMap[processId] = uploader
  }

  override fun cancelUpload(processID: String) {
      uploaderMap[processID]?.cancelUpload()
  }

  override fun downloadFile(readable: ReadableMap) {
    
  }

  override fun cancelDownload(processID: String) {
    
  }

  override fun pauseDownload(processID: String) {
    
  }

  override fun resumeDownload(processID: String) {
    
  }
}
