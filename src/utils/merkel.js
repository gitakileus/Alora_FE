const { MerkleTree } = require('merkletreejs');
const SHA256 = require('keccak256');

const whitelisters = [
    '0x7ACf46627094FA89339DB5b2EB862F0E8Ea4D9fc', 
    '0x37f4a13f3Af9a8397d09c0Dc3ca508dB6181e492', 
    '0xf0EBDd31b3C62683f6463E67aCD14D9cE4FA4d43',
    '0x25eb1e647261C7DbE696536572De61b1a302a83C',
    '0xf35B008dC2737E4394BF0b671E54A74d2fFDD9a3',
    '0xFFE4e3C809418aEFB00922ffCa6b46d9d8f41B6c',
    '0x9659c67959F73303825E78Ddf445a42ef07Cb0DD',
    '0xD49496948533E5aEEE247f7B3380aF6a1040fE7E',
    '0x1793890908303f637745071abAB41453fcFbaF13'
];

const leaves = whitelisters.map(x => SHA256(x))
  const tree = new MerkleTree(leaves, SHA256, {sortPairs: true})
  const root = tree.getRoot().toString('hex')
  const leaf = SHA256('0xD49496948533E5aEEE247f7B3380aF6a1040fE7E')
  const proof = tree.getProof(leaf)
  console.log("proof ===================");
  console.log(proof)
  console.log("leaf ===================");
  console.log(leaf)
  console.log("root ===================");
  console.log(root)
  console.log("tree.verify ===================");
  console.log(tree.verify(proof, leaf, root)) // true
  const Hexroot = tree.getHexRoot();
  console.log("===================");
  console.log(Hexroot);
  console.log("===================");
  console.log(tree.print());
  console.log("===================");
  console.log("Array Length: ", whitelisters.length -1);
  const HexProof = tree.getHexProof(leaves[8]);
  console.log(HexProof);