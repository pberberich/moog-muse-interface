#include "PluginEditor.h"
#include "BinaryData.h"

static const char* mimeForPath (const juce::String& path)
{
    if (path.endsWithIgnoreCase (".html"))        return "text/html";
    if (path.endsWithIgnoreCase (".js"))          return "text/javascript";
    if (path.endsWithIgnoreCase (".css"))         return "text/css";
    if (path.endsWithIgnoreCase (".svg"))         return "image/svg+xml";
    if (path.endsWithIgnoreCase (".json"))        return "application/json";
    if (path.endsWithIgnoreCase (".webmanifest")) return "application/manifest+json";
    if (path.endsWithIgnoreCase (".png"))         return "image/png";
    if (path.endsWithIgnoreCase (".woff2"))       return "font/woff2";
    return "application/octet-stream";
}

std::optional<juce::WebBrowserComponent::Resource> MuseEditor::lookUpResource (const juce::String& url)
{
    // Vite emits a flat-ish tree (index.html + assets/*); BinaryData flattens
    // directories, so matching on the final path component is sufficient.
    auto fileName = (url == "/" || url.isEmpty())
                        ? juce::String ("index.html")
                        : url.fromLastOccurrenceOf ("/", false, false);

    for (int i = 0; i < BinaryData::namedResourceListSize; ++i)
    {
        const char* resourceName = BinaryData::namedResourceList[i];
        if (fileName == BinaryData::getNamedResourceOriginalFilename (resourceName))
        {
            int dataSize = 0;
            if (const char* data = BinaryData::getNamedResource (resourceName, dataSize))
            {
                const auto* bytes = reinterpret_cast<const std::byte*> (data);
                return juce::WebBrowserComponent::Resource {
                    std::vector<std::byte> (bytes, bytes + dataSize),
                    juce::String (mimeForPath (fileName))
                };
            }
        }
    }

    return std::nullopt;
}

MuseEditor::MuseEditor (MuseProcessor& p)
    : AudioProcessorEditor (&p),
      museProcessor (p),
      web (juce::WebBrowserComponent::Options {}
               .withNativeIntegrationEnabled()
               .withResourceProvider ([] (const juce::String& url) { return lookUpResource (url); })
               .withEventListener ("midiFromUI",
                                   [this] (juce::var payload)
                                   {
                                       if (auto* bytes = payload.getProperty ("bytes", {}).getArray())
                                       {
                                           std::vector<juce::uint8> data;
                                           for (const auto& b : *bytes)
                                               data.push_back (static_cast<juce::uint8> (static_cast<int> (b)));
                                           if (! data.empty())
                                               museProcessor.queueMessageToHost (
                                                   juce::MidiMessage (data.data(), static_cast<int> (data.size())));
                                       }
                                   }))
{
    addAndMakeVisible (web);
    web.goToURL (juce::WebBrowserComponent::getResourceProviderRoot());

    setResizable (true, true);
    setResizeLimits (900, 600, 4096, 4096);
    setSize (1280, 860);
    startTimerHz (30);
}

void MuseEditor::resized()
{
    web.setBounds (getLocalBounds());
}

void MuseEditor::timerCallback()
{
    for (const auto& m : museProcessor.drainMessagesToUI())
    {
        juce::Array<juce::var> bytes;
        for (int i = 0; i < m.getRawDataSize(); ++i)
            bytes.add (static_cast<int> (m.getRawData()[i]));

        auto* obj = new juce::DynamicObject();
        obj->setProperty ("bytes", bytes);
        web.emitEventIfBrowserIsVisible ("midiToUI", juce::var (obj));
    }
}
