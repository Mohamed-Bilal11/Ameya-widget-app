package com.awesomeproject;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;

public class SpeechRecognizerModule extends ReactContextBaseJavaModule implements RecognitionListener{

    private SpeechRecognizer speechRecognizer = null;
    private ReactApplicationContext reactContext;
    private boolean isListening = false;

    public SpeechRecognizerModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }
    
    @NonNull
    @Override
    public String getName() {
        return "SpeechRecognizerModule";
    }

    @ReactMethod
    public void startListening() {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                // Destroy existing recognizer to ensure clean state
                if (speechRecognizer != null) {
                    speechRecognizer.destroy();
                    speechRecognizer = null;
                }
                
                // Create new recognizer
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext);
                speechRecognizer.setRecognitionListener(SpeechRecognizerModule.this);
                isListening = true;
                
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                // Add more reliable settings
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
                intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactContext.getPackageName());
                
                speechRecognizer.startListening(intent);
            }
        });
    }

    @ReactMethod
    public void stopListening() {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                isListening = false;
                if (speechRecognizer != null) {
                    speechRecognizer.stopListening();
                }
            }
        });
    }

    @ReactMethod
    public void destroyRecognizer() {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                isListening = false;
                if (speechRecognizer != null) {
                    speechRecognizer.destroy();
                    speechRecognizer = null;
                }
            }
        });
    }

    @Override
    public void onResults(Bundle results){
     ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
     if(matches != null && !matches.isEmpty()){
         System.out.println("Speech result: " + matches.get(0));
         sendEvent("onSpeechResults",matches.get(0));
     }
     
     // Restart listening immediately for continuous mode
     if (isListening) {
         System.out.println("Restarting listening for continuous mode...");
         new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
             @Override
             public void run() {
                 if (isListening && speechRecognizer != null) {
                     try {
                         Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                         intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                         intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
                         intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                         intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
                         intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactContext.getPackageName());
                         speechRecognizer.startListening(intent);
                         System.out.println("Successfully restarted listening");
                     } catch (Exception e) {
                         System.out.println("Error restarting listening: " + e.getMessage());
                     }
                 }
             }
         }, 100); // Slightly longer delay for better stability
     }
    }

   @Override
   public void onPartialResults(Bundle results){
    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    if(matches != null && !matches.isEmpty()){
        sendEvent("onSpeechResults",matches.get(0));
    }
   }

   private void sendEvent(String eventName,String params){
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName,params);
   }

   @Override 
   public void onReadyForSpeech(Bundle params){}
   
   @Override 
   public void onBeginningOfSpeech(){
       System.out.println("Speech beginning detected");
   }
   
   @Override 
   public void onRmsChanged(float rmsdB){
       // This is called continuously while speech is detected
       // We can use this to detect if speech is still happening
   }
   
   @Override 
   public void onEndOfSpeech(){
       System.out.println("Speech ended, but continuing to listen...");
       // Don't stop listening automatically - let user control it
       // The recognizer will continue listening for more speech
   }
   
   @Override 
   public void onError(int error){
       System.out.println("SpeechRecognizer error: " + error);
       
       if (isListening) {
           // Only restart for specific recoverable errors
           if (error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT || 
               error == SpeechRecognizer.ERROR_NO_MATCH ||
               error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY) {
               
               new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                   @Override
                   public void run() {
                       if (isListening) {
                           // Destroy and recreate for better reliability
                           if (speechRecognizer != null) {
                               speechRecognizer.destroy();
                               speechRecognizer = null;
                           }
                           
                           speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext);
                           speechRecognizer.setRecognitionListener(SpeechRecognizerModule.this);
                           
                           Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                           intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                           intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
                           intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                           intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
                           intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactContext.getPackageName());
                           
                           speechRecognizer.startListening(intent);
                       }
                   }
               }, 500); // Longer delay for better recovery
           }
       }
   }
   
   @Override 
   public void onEvent(int eventType,Bundle params){}
   
   @Override 
   public void onBufferReceived(byte[] buffer){}

}
