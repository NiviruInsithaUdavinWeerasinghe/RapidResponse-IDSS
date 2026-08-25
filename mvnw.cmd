@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - Location of a JDK home directory
@REM
@REM Optional ENV vars
@REM MAVEN_BATCH_ECHO - set to 'on' to enable the echoing of the batch commands
@REM MAVEN_BATCH_PAUSE - set to 'on' to enable the pausing after the execution of the maven commands
@REM MAVEN_OPTS - parameters passed to the Java VM when running Maven
@REM     e.g. to debug Maven itself, use
@REM     set MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000
@REM ----------------------------------------------------------------------------

@if "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%

@setlocal
@set DIRNAME=%~dp0
@if "%DIRNAME%" == "" set DIRNAME=.\

@set WRAPPER_JAR="%DIRNAME%.mvn\wrapper\maven-wrapper.jar"
@set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@REM Find Java
@if not "%JAVA_HOME%" == "" goto OkJHome

@set JAVA_EXE=java.exe
@%JAVA_EXE% -version >NUL 2>&1
@if %ERRORLEVEL% == 0 goto RunLauncher

@echo.
@echo ERROR: JAVA_HOME not found in your environment.
@echo Please set the JAVA_HOME variable in your Environment Variables to point to a JDK folder.
@goto error

:OkJHome
@set JAVA_EXE="%JAVA_HOME%\bin\java.exe"

:RunLauncher
@REM Download the wrapper jar if missing
@if exist %WRAPPER_JAR% goto CheckJava
@echo Downloading Maven Wrapper bootstrapper...
@powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', %WRAPPER_JAR%)"

:CheckJava
@REM Run Maven Wrapper main class
%JAVA_EXE% %MAVEN_OPTS% -Dmaven.multiModuleProjectDirectory="%DIRNAME:~0,-1%" -classpath %WRAPPER_JAR% %WRAPPER_LAUNCHER% %*
@if %ERRORLEVEL% neq 0 goto error
@goto end

:error
@exit /B 1

:end
@endlocal
