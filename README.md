# Drunk Driving Detection

Drunk driving is actually one of the most problematic factors in driving. To prevent such drunk driving, we propose our system. This system can be used with a smart watch or smart phone. Drinking is detected by machine learning.

![image](https://user-images.githubusercontent.com/17453822/85755512-fab64900-b748-11ea-8ef3-b28b8f762d48.png)


### Main Process 

1. We recognize biometric data through smart watches.

1. This information is sent to the smartphone.

1. The smartphone sends this data to the server through the API and server determined whether or not to drink.

1. If it is determined to be drinking, the driving detection schedule starts.
    - If driving detection schedule was started
        1. It uses the beacon placed in the driver's seat to locate the user.
        1. If it is determined that the user has been seated in the driver's seat, an alert process is initiated.
        1. At this time, we can use multiple beacons to improve driver seat determination accuracy.
        
<a href="https://github.com/banksemi/drunk-driving-detection/wiki">See the wiki for more details.</a>

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Minimum Requirements

- **Hardware**
    - Android-based smartphone
    - Tizen-based smart watch
    - Beacon

- **Software**
    - IDE
        - Android Studio >= 3.0
        - Tizen Studio
        - Visual code (Angular 8)
    - Back-end software
        - Apache 2.4
        - PHP 7.0
        - MariaDB 10

### Installing & Deployment
- Detailed installation and environment information can be found [here](https://github.com/banksemi/drunk-driving-detection/wiki/Installation).

- If you want to understand the project structure, please refer to [this page](https://github.com/banksemi/drunk-driving-detection/wiki/Project-Structure).

## Built With

* [ngx-admin](https://github.com/akveo/ngx-admin/) - The web framework used


## Authors

* **Seunghwa, Lee** - *Project integration & Detect drinking* - [banksemi](https://github.com/banksemi)
* **Juuyong, Jeon** - *User interface* - [juuyoungjeon](https://github.com/juuyoungjeon)
* **ClimbGoldy** - *Detect driving* - [ClimbGoldy](https://github.com/ClimbGoldy)

See also the list of [contributors](https://github.com/banksemi/drunk-driving-detection/contributors) who participated in this project.


-------------
## Wiki Pages

**The details of this project are stored in the wiki.**


<h3>Introduction</h3>
<ul>
<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/">1. Home</a></li>
<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/System-Architecture">2. System Architecture</a></li>
<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/Data-Analysis">3. Data Analysis</a></li>
<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/Drinking-Warning-Function">4. Drinking Warning Function</a></li>
</ul>


<h3>Installation</h3>
<ul>

<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/Project-Structure">1. Project Structure</a></li>
<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/Installation">2. Installation</a></li>
</ul>

<h3>Development</h3>
<ul>
<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/API-List">1. Web API</a></li>
<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/New-API-Development">2. New API Development</a></li>
<li><a href="https://github.com/banksemi/drunk-driving-detection/wiki/Drinking-Prediction-Model">3. Drinking Prediction Model</a></li>
</ul>
