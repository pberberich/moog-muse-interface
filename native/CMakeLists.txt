# JUCE wrapper for the Moog Muse Interface.
#
# The whole UI and all MIDI logic live in the TypeScript app (../src); this
# target embeds the built web app (../dist) into a thin WebView shim and
# exposes it as AU / VST3 / Standalone. Build the web app first:
#
#   npm run build            # in the repo root
#   cmake -B native/build -S native
#   cmake --build native/build --config Release
#
# iPad: JUCE also supports iOS targets (Standalone + AUv3). Generate an Xcode
# project with `cmake -B native/build-ios -S native -G Xcode
# -DCMAKE_SYSTEM_NAME=iOS` and add the AUv3 format below if desired.

cmake_minimum_required(VERSION 3.22)
project(MoogMuseInterface VERSION 0.1.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
  JUCE
  GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
  GIT_TAG 8.0.6
  GIT_SHALLOW TRUE
)
FetchContent_MakeAvailable(JUCE)

file(GLOB_RECURSE MUSE_UI_FILES CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/../dist/*")
if(NOT MUSE_UI_FILES)
  message(FATAL_ERROR "../dist is empty — run `npm run build` in the repo root first.")
endif()
juce_add_binary_data(MuseUIData SOURCES ${MUSE_UI_FILES})

set(MUSE_FORMATS VST3 Standalone)
if(APPLE)
  list(APPEND MUSE_FORMATS AU)
endif()

juce_add_plugin(MoogMuseInterface
  COMPANY_NAME "MuseInterface"
  PRODUCT_NAME "Moog Muse Interface"
  FORMATS ${MUSE_FORMATS}
  PLUGIN_MANUFACTURER_CODE Mmsi
  PLUGIN_CODE Muse
  IS_SYNTH FALSE
  NEEDS_MIDI_INPUT TRUE
  NEEDS_MIDI_OUTPUT TRUE
  IS_MIDI_EFFECT FALSE
  NEEDS_WEBVIEW2 TRUE
  COPY_PLUGIN_AFTER_BUILD TRUE
)

target_sources(MoogMuseInterface PRIVATE
  src/PluginProcessor.cpp
  src/PluginEditor.cpp
)

target_compile_definitions(MoogMuseInterface PRIVATE
  JUCE_WEB_BROWSER=1
  JUCE_USE_CURL=0
  JUCE_VST3_CAN_REPLACE_VST2=0
)

target_link_libraries(MoogMuseInterface
  PRIVATE
    MuseUIData
    juce::juce_audio_utils
    juce::juce_gui_extra
  PUBLIC
    juce::juce_recommended_config_flags
    juce::juce_recommended_warning_flags
)
