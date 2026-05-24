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
    uint256 constant alphax  = 1191451976383628443424885096782485568199290829212186996181669016670052787151;
    uint256 constant alphay  = 12124777763720858205519360439168392008358048338658073858228666195997447041259;
    uint256 constant betax1  = 2042474742630987324201290601661415716734417082531120848156039006298270826254;
    uint256 constant betax2  = 14138451240518468730673556196610905977158474744269720315667690115980176493850;
    uint256 constant betay1  = 8525393162868278883194698767041138281175221572218235717555941520446350357967;
    uint256 constant betay2  = 1215737438071609621889683270564953690437744479178745755300308941581457741387;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 20512505531564272962294866605686998028387592024223475788699723378356426656516;
    uint256 constant deltax2 = 3492822759063347699521740292153525905357652638886859976285351847971869656155;
    uint256 constant deltay1 = 11642276978300902405304698799442652715953584590192054738231537448409928510837;
    uint256 constant deltay2 = 1755050540153695240224528250937446497044531164223209028929259994196742147148;

    
    uint256 constant IC0x = 3223452496153254388672839592028865310087104156270518319400194156606631501339;
    uint256 constant IC0y = 7803830972142505457157409324635870564514839389202397998050702318422594353308;
    
    uint256 constant IC1x = 12776482591349722822943747728140065056617482206044676014553631997356574155212;
    uint256 constant IC1y = 3635848765275349840560905995889894231510953471948656656176470353571435461537;
    
    uint256 constant IC2x = 7401122370017089047677443466811613998616432562848985994082197982781320595266;
    uint256 constant IC2y = 19882716006057807197624377535734110277261427121249942876522059071812351703228;
    
    uint256 constant IC3x = 7652911274853323910392607449397716370791329738878258467699126361790805397403;
    uint256 constant IC3y = 21431721528032538843173466328589321062860023882145589259207398586041304306203;
    
    uint256 constant IC4x = 19066947412946138130324938562541492202144627181556098942473042595078683191926;
    uint256 constant IC4y = 6337004935952574724785672478073712831667926817523027561763431911057374055669;
    
    uint256 constant IC5x = 16642976616432826819542757193120808257315306231352763188657852216019895405566;
    uint256 constant IC5y = 10150207199503212560870023969592349567470139425619180741480337841635105100833;
    
    uint256 constant IC6x = 21710683691765975890805994450962318074886391327548996081415106213821688711447;
    uint256 constant IC6y = 9122052799125541829503211333371632718635195837719992471174434245590864603000;
    
    uint256 constant IC7x = 20300428052580451722047503310380482024028208716807443356335955654736849323181;
    uint256 constant IC7y = 11085932566431602902997128179023386526292193158696718731039299659805026244072;
    
    uint256 constant IC8x = 17372206283020979424266972699125610949588625356453521753179313798776158346423;
    uint256 constant IC8y = 21093274795599588236167249096980534453833152540517885978376927989758803080298;
    
    uint256 constant IC9x = 2866860026343866013395737872237800404123699726185686851359756925977042957273;
    uint256 constant IC9y = 11633871250005480565958473119908456157951471643782526345958010788819525720541;
    
    uint256 constant IC10x = 8062634617138653733330227377301546710825852935444240394309948369768657698660;
    uint256 constant IC10y = 6717376409857473886827414113805289929217424121715915372802195786840067524148;
    
    uint256 constant IC11x = 18036025566173939343525304567742209386333617983698802260975574362070838181922;
    uint256 constant IC11y = 17566371750419469686544494448466519105451400713980210079967184284466712302091;
    
    uint256 constant IC12x = 9124877580939310807127924463646222717682317413942746969095356222780005172098;
    uint256 constant IC12y = 6452936530936897238597497325068116971863340238292276408144332209302462588530;
    
    uint256 constant IC13x = 16887052850542930368591972446749920377153319379457567048743172549392092622296;
    uint256 constant IC13y = 6988639131380853503919016683600233867111523698147861371356297326614725911077;
    
    uint256 constant IC14x = 10064411488800765077183786440070668646643271855790477749208801441198374923689;
    uint256 constant IC14y = 7350223157201328438328323832421021347071165875006472231732535475515990284759;
    
    uint256 constant IC15x = 4880255304025225686199768276672030095155413188347570393180370479038091716307;
    uint256 constant IC15y = 11467769617560405148817194485274771056630818118539286049998202675691151319837;
    
 
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
