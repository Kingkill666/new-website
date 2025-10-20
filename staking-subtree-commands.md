# Staking Subtree Management Commands

The staking repository has been added as a git subtree. Here are the commands you'll need to manage it:

## Adding the Subtree (Already Done)
```bash
git remote add staking-origin git@github.com:VMFCoin/staking.git
git fetch staking-origin
git subtree add --prefix=staking staking-origin main --squash
```

## Updating the Subtree (Pull Changes from Staking Repo)
```bash
git subtree pull --prefix=staking staking-origin main --squash
```

## Pushing Changes to the Staking Repo
```bash
# After making changes to files in the staking/ directory
git add staking/
git commit -m "Update staking functionality"
git subtree push --prefix=staking staking-origin main
```

## Alternative: Push with Squash
```bash
git subtree push --prefix=staking staking-origin main --squash
```

## Viewing Subtree History
```bash
git log --oneline --grep="Squashed 'staking/'"
```

## Removing the Subtree (if needed)
```bash
git rm -r staking/
git commit -m "Remove staking subtree"
```

## Notes:
- The `--squash` flag combines all commits from the subtree into a single commit
- Changes made in the staking/ directory can be pushed back to the original repository
- The subtree maintains a connection to the original repository
- You can work on the staking code directly in the staking/ directory

## Current Status:
✅ Staking repository added as subtree in `staking/` directory
✅ Remote `staking-origin` configured
✅ Ready for development and updates
