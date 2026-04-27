// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 13451687149922014074963678646437440808962834566253913004803687217222691529074;
    uint256 constant alphay  = 2391127144153143989693551966427163138416911431951208208691269552853707233931;
    uint256 constant betax1  = 8328394865734986471226036297560182256579211884086306120301016825712851147979;
    uint256 constant betax2  = 11118965567991504338632437008677006294869612820882065886907239068502980891686;
    uint256 constant betay1  = 8384610207986268993245945387483162511894831344033173966198862878918213899081;
    uint256 constant betay2  = 19770394748171763407115633576687893900361300893892649487673564099267611758242;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 5085699714806070023452014959055685015399921248698219337032800160624798893197;
    uint256 constant deltax2 = 4661597344927073765288588539118748865569681820003799714121882495007195888060;
    uint256 constant deltay1 = 19650790549806792925251484688637708677090621768539922157846160084084232630645;
    uint256 constant deltay2 = 5839508512201476897456932975964727789733905202665664611803326478514407207980;

    
    uint256 constant IC0x = 276396527721828726164719592000142363668943153532281903600415750646389614838;
    uint256 constant IC0y = 10543090229274376075843447131502342987662837845632271405440479834162276336952;
    
    uint256 constant IC1x = 7499169016199211100864472515984043182492791213952708121365851635312911941214;
    uint256 constant IC1y = 11907847744537696485810140488799629773377466674712157246732617346527858933721;
    
    uint256 constant IC2x = 10538799705308754824640232545003224710654256155469469080021530911440135922137;
    uint256 constant IC2y = 11800823383904042793491498926672262355108061601266918548506849333816835599396;
    
    uint256 constant IC3x = 2150625159614407505727581230202923095965344177315328757962864699477939234512;
    uint256 constant IC3y = 14886838568799950405970521115496578719697512331021035939465626634992960789584;
    
    uint256 constant IC4x = 1194883722511925536600336033343568001422077026529645696921224480052574534141;
    uint256 constant IC4y = 4880919343747121511485864918104125502221879827401230330246806328774737684268;
    
    uint256 constant IC5x = 6734539874856514765045716167469739267861167914209416329090727582814496192482;
    uint256 constant IC5y = 11470641198525396629352381431867698414619792822241366443186870435238902844728;
    
    uint256 constant IC6x = 10228498912158332399451690569990618455366432626806691704035264373942605255728;
    uint256 constant IC6y = 10983516967216642018643223666398075708660155035758160286571106550409391321729;
    
    uint256 constant IC7x = 11667771757459111120870750088515596819776844305162719201597128219612117797248;
    uint256 constant IC7y = 19438216179305451765929487108819495886904922075161735385340115063376370599717;
    
    uint256 constant IC8x = 11029653065679628299723977734132479891288140513119153074077008174891901801445;
    uint256 constant IC8y = 1982855281690146867331547877657598778841053979315252614167004036944825711833;
    
    uint256 constant IC9x = 20408118220566998678966644848867249274561634058857375022731936285234091104529;
    uint256 constant IC9y = 326715038794722760129856337456627029261781360992635702552945287915488737783;
    
    uint256 constant IC10x = 2991050920965157433067983725654612612098675046310738740625370545829949576933;
    uint256 constant IC10y = 11940198005587152104035180745249625074219021386691853120650622156557512527223;
    
    uint256 constant IC11x = 17634054901592630135720567401627309597145694601239922159243499712036217870706;
    uint256 constant IC11y = 47615399862096134878496399039720482255015014065790882791988808810038913547;
    
    uint256 constant IC12x = 16707899854182534646865581885622725651868050948955615500763648447471260623619;
    uint256 constant IC12y = 12825249152349974686906031082077750999970873914279857657201840083610328428740;
    
    uint256 constant IC13x = 16749516805234972581204964956624259250910399074685740133004838731943851854365;
    uint256 constant IC13y = 20797094444526878903738216513544938588645948002420995162545333610124617875731;
    
    uint256 constant IC14x = 8024753234203764026611604249793414392142733215449977241975823002369872927464;
    uint256 constant IC14y = 20262504776959679758291541630056468590805222772994594632305106201912684132157;
    
    uint256 constant IC15x = 20835516496810938993390473334976347625106884917247399131807252989065384569662;
    uint256 constant IC15y = 10339823108088146809669145280057275370608050076380152583838972766642284513697;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[15] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                
                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))
                
                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))
                
                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            
            checkField(calldataload(add(_pubSignals, 384)))
            
            checkField(calldataload(add(_pubSignals, 416)))
            
            checkField(calldataload(add(_pubSignals, 448)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
