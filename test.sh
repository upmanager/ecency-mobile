echo "Create podspec for realm"
cat > ./node_modules/realm/realm.podspec << ENDOFFILE
require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']

  s.authors      = package['author']
  s.homepage     = package['homepage']
  s.platform     = :ios, "7.0"

  s.source       = { :git => "https://github.com/realm/realm-js.git", :tag => "#{s.version}" }
  s.source_files  = "ios/*.{h,m}"

  s.dependency 'React'
end
ENDOFFILE