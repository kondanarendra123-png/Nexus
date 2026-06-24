close all;
clc;
e=1.6e-19;
fprintf('Select What you want to calculate:\n');
fprintf('1. Current(I)\n');
fprintf('2. Time(t)\n');
fprintf('3. Number of Electrons(n)\n');
Choice=input('Enter choice (1-3): ');
switch Choice
    case 1
    option=input('Enter the input you have (Q or n); ','s');
    switch lower(option)
        case 'q'
            Q=input('Enter Q: ');
            t=input('Enter t: ');
            I=Q/t;
            fprintf('\nCurrent(I) : %e Amperes\n',I);
        case 'n'
            n=input('Enter n: ');
            t=input('Enter t: ');
            Q=n*e;
            I=Q/t;
            fprintf('\nCurrent(I): %e Amperes\n',I);
        otherwise
            fprintf('Invalid input! Please Enter Q or n\n');
    end
    case 2
         option=input('Enter the input you have (Q or n); ','s');
    switch lower(option)
        case 'q'
            Q=input('Enter Q: ');
            I=input('Enter I: ');
            t=Q/I;
            fprintf('\ntime(t) : %e sec\n',t);
        case 'n'
            n=input('Enter n: ');
            I=input('Enter I: ');
            Q=n*e;
            t=Q/I;
            fprintf('\ntime(t) : %e sec\n',t);
        otherwise
            fprintf('Invalid input! Please Enter Q or n\n');
    end
    case 3
        option=input('Enter the input you have (Q or I): ');
        switch lower(option)
            case q
                Q=input('Enter Q: ');
                n=Q/e;
                fprintf('\nThe no of electrons are : %e ',n);
            case i
                I=input('Enter I: ');
                t=input('Enter t: ');
                Q=I*t;
                n=Q/e;
                fprintf('\nThe no of electrons are: %e ',n);
        end
end
        