# wav-processor - parse, and display wav file information script.

## description
parse, and display wav file information script.

## usage
use this command.

```
    npm run parse -- wav-file.wav
```

this command will display wav info.

```
    position  length  header                data  
    --------  ------  --------------------  ------
    0         4       Chunk ID "RIFF"       RIFF  
    4         4       Chunk Size            239982
    8         4       Format "WAVE"         WAVE  
    12        4       Subchunk1 ID "fmt "   fmt   
    16        4       Subchunk1 Size        16    
    20        2       Audio Format "1" PCM  1     
    22        2       Num Channels          1     
    24        4       Sample Rate           44100 
    28        4       Byte Rate             88200 
    32        2       Block Align           2     
    34        2       Bits Per Sample       16    
    36        4       Subchunk2 ID "data"   data  
    40        4       Subchunk2 Size        239946
    44        239946  Wave Data             ******
```



