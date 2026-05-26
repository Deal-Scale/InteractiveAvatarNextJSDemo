Safety Telemetry

By default, Safety receives non-sensitive, anonymized telemetry data when scans are performed. These data are captured solely for the purpose of delivering, maintaining and improving the Safety product.

The data captured include the following: 
Name
Description
Essential / Optional

Safety Version (safety_version)

The version of Safety that was used, e.g. v3.0.1. 

Essential

Safety Source

(safety_source)

The method by which Safety was used, e.g. via the CLI or via code. 

Essential

Safety Command

(safety_command)

Limited to the command used when running the scan (e.g. safety scan, safety check)

Optional

Safety Options

(safety_options)

Limited to the options used and how many times each is used, e.g. -r, --output, et al.

Optional

Python Version 

(python_version)

The version of Python installed.

Optional

OS Type

(os_type)

The OS type used.

Optional

OS Release

(os_release)

The version of the OS used.

Optional

OS Description (os_description)

Description of the OS used.

Optional
Disabling Non-Essential Telemetry Data

It is possible to disable the non-essential telemetry data by using the following option:

--disable-optional-telemetry e.g. safety scan --disable-optional-telemetry

When this option is employed, Safety will still collect the anonymized Safety Version and Safety Source. These data are required for us to be able to give our customers security protection, including security protection if Safety itself needs an update. We may also use the safety_version to alert customers of any vulnerability or risk and recommend the user upgrade.